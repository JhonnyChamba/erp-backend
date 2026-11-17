import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { PlayerRegistrationOrmEntity } from '../../infrastructure/persistence/player-registration.orm-entity';
import { PlayerOrmEntity } from '../../infrastructure/persistence/player.orm-entity';
import { TeamRegistrationOrmEntity } from '../../infrastructure/persistence/team-registration.orm-entity';
import { StageOrmEntity } from '../../infrastructure/persistence/stage.orm-entity';
import { EditionCategoryDetailOrmEntity } from '../../infrastructure/persistence/edition-category-detail.orm-entity';
import { TournamentTransferConfigOrmEntity } from '../../infrastructure/persistence/tournament-transfer-config.orm-entity';
import { PlayerRegistrationHistoryOrmEntity } from '../../infrastructure/persistence/player-registration-history.orm-entity';
import { PlayerRegistrationStatus, PlayerRegistrationHistoryAction } from '../../common/enum/campeonato.enum';
import {
  CreatePlayerRegistrationDto,
  UpdatePlayerRegistrationDto,
  MassPlayerRegistrationDto,
  UpdatePlayerRegistrationStatusDto,
} from './dto/player-registration.dto';

@Injectable()
export class PlayerRegistrationsService {
  constructor(
    @InjectRepository(PlayerRegistrationOrmEntity)
    private readonly repo: Repository<PlayerRegistrationOrmEntity>,
    @InjectRepository(PlayerOrmEntity)
    private readonly playerRepo: Repository<PlayerOrmEntity>,
    @InjectRepository(TeamRegistrationOrmEntity)
    private readonly teamRegistrationRepo: Repository<TeamRegistrationOrmEntity>,
    @InjectRepository(StageOrmEntity)
    private readonly stageRepo: Repository<StageOrmEntity>,
    @InjectRepository(EditionCategoryDetailOrmEntity)
    private readonly editionCategoryDetailRepo: Repository<EditionCategoryDetailOrmEntity>,
    @InjectRepository(TournamentTransferConfigOrmEntity)
    private readonly transferConfigRepo: Repository<TournamentTransferConfigOrmEntity>,
    @InjectRepository(PlayerRegistrationHistoryOrmEntity)
    private readonly historyRepo: Repository<PlayerRegistrationHistoryOrmEntity>,
    private readonly dataSource: DataSource,
  ) {}

  private async validateDemarcationLimit(
    playerId: string,
    teamRegistrationId: string,
    currentRegistrationId?: string,
    runnerRepo?: Repository<PlayerRegistrationOrmEntity>,
  ) {
    if (!playerId || !teamRegistrationId) return;

    const player = await this.playerRepo.findOne({
      where: { id: playerId },
      relations: ['demarcation'],
    });

    if (!player || !player.demarcation) return;

    const demarcation = player.demarcation;
    const maxAllowed = Number(demarcation.maxPlayers);

    if (!maxAllowed || maxAllowed <= 0) return;

    const repository = runnerRepo || this.repo;
    const qb = repository
      .createQueryBuilder('pr')
      .leftJoin('pr.player', 'p')
      .where('pr.teamRegistrationId = :teamRegistrationId', { teamRegistrationId })
      .andWhere('pr.status != :finalizedStatus', { finalizedStatus: PlayerRegistrationStatus.FINALIZED_BY_TRANSFER })
      .andWhere('p.demarcationId = :demarcationId', { demarcationId: demarcation.id });

    if (currentRegistrationId) {
      qb.andWhere('pr.id != :currentRegistrationId', { currentRegistrationId });
    }

    const count = await qb.getCount();

    if (count >= maxAllowed) {
      throw new BadRequestException(
        `Límite de inscripción excedido: El equipo ya cuenta con ${count} jugador(es) en la posición/demarcación "${demarcation.name}". El límite máximo permitido para este torneo es de ${maxAllowed}.`,
      );
    }
  }

  private async validateDuplicateAndJersey(
    playerId: string,
    teamRegistrationId: string,
    jerseyNumber?: number,
    currentRegistrationId?: string,
    runnerRepo?: Repository<PlayerRegistrationOrmEntity>,
  ) {
    if (!teamRegistrationId) return;
    const repository = runnerRepo || this.repo;

    // 1. Validar que el jugador no esté inscrito dos veces en el mismo equipo/edición
    if (playerId) {
      const qbPlayer = repository
        .createQueryBuilder('pr')
        .where('pr.teamRegistrationId = :teamRegistrationId', { teamRegistrationId })
        .andWhere('pr.playerId = :playerId', { playerId })
        .andWhere('pr.status != :finalizedStatus', { finalizedStatus: PlayerRegistrationStatus.FINALIZED_BY_TRANSFER });

      if (currentRegistrationId) {
        qbPlayer.andWhere('pr.id != :currentRegistrationId', { currentRegistrationId });
      }
      const existingPlayer = await qbPlayer.getOne();
      if (existingPlayer) {
        throw new BadRequestException('El jugador ya se encuentra inscrito en la nómina activa de este equipo para esta edición del torneo.');
      }
    }

    // 2. Validar dorsal único por equipo si se proporciona
    if (jerseyNumber !== undefined && jerseyNumber !== null && Number(jerseyNumber) > 0) {
      const qbJersey = repository
        .createQueryBuilder('pr')
        .where('pr.teamRegistrationId = :teamRegistrationId', { teamRegistrationId })
        .andWhere('pr.jerseyNumber = :jerseyNumber', { jerseyNumber })
        .andWhere('pr.status != :finalizedStatus', { finalizedStatus: PlayerRegistrationStatus.FINALIZED_BY_TRANSFER });

      if (currentRegistrationId) {
        qbJersey.andWhere('pr.id != :currentRegistrationId', { currentRegistrationId });
      }
      const existingJersey = await qbJersey.getOne();
      if (existingJersey) {
        throw new BadRequestException(`El número de dorsal #${jerseyNumber} ya está asignado a otro jugador activo en este equipo.`);
      }
    }
  }

  private async validateStageAndClassificationLimits(
    teamRegistrationId: string,
    playerClassificationId?: string,
    stageId?: string,
    currentRegistrationId?: string,
    runnerRepo?: Repository<PlayerRegistrationOrmEntity>,
  ) {
    if (!teamRegistrationId) return;

    const teamRegistration = await this.teamRegistrationRepo.findOne({
      where: { id: teamRegistrationId },
      relations: ['team', 'categoryEdition'],
    });

    if (!teamRegistration || !teamRegistration.categoryEditionId) return;

    // Validar configuración de torneo si existe
    const config = await this.transferConfigRepo.findOne({
      where: { editionId: teamRegistration.categoryEditionId },
    });
    if (config) {
      if (!config.inscriptionsEnabled) {
        throw new BadRequestException('El período de inscripciones se encuentra cerrado para este campeonato.');
      }
      const now = new Date();
      if (config.inscriptionsStartDate && new Date(config.inscriptionsStartDate) > now) {
        throw new BadRequestException(`Las inscripciones abrirán el ${new Date(config.inscriptionsStartDate).toLocaleDateString()}.`);
      }
      if (config.inscriptionsEndDate && new Date(config.inscriptionsEndDate) < now) {
        throw new BadRequestException(`El plazo de inscripciones finalizó el ${new Date(config.inscriptionsEndDate).toLocaleDateString()}.`);
      }
    }

    // Buscar el detalle de categoría correspondiente
    const categoryDetails = await this.editionCategoryDetailRepo.find({
      where: { editionId: teamRegistration.categoryEditionId },
      relations: ['classifications', 'classifications.playerClassification'],
    });

    if (!categoryDetails || categoryDetails.length === 0) return;
    const categoryDetail = categoryDetails[0];

    // 1. Validar límite máximo de jugadores inscritos por equipo
    const maxPlayers = categoryDetail.maxPlayers;
    const repository = runnerRepo || this.repo;

    if (maxPlayers && maxPlayers > 0) {
      const qbTotal = repository
        .createQueryBuilder('pr')
        .where('pr.teamRegistrationId = :teamRegistrationId', { teamRegistrationId })
        .andWhere('pr.status != :finalizedStatus', { finalizedStatus: PlayerRegistrationStatus.FINALIZED_BY_TRANSFER });

      if (currentRegistrationId) {
        qbTotal.andWhere('pr.id != :currentRegistrationId', { currentRegistrationId });
      }

      const totalCount = await qbTotal.getCount();
      if (totalCount >= maxPlayers) {
        throw new BadRequestException(
          `Límite de jugadores inscritos excedido: El equipo "${teamRegistration.team?.name || 'Club'}" ya ha alcanzado el límite máximo de ${maxPlayers} jugador(es) inscritos para la categoría "${categoryDetail.categoryDescription || 'Categoría'}".`,
        );
      }
    }

    // 2. Validar clasificaciones de futbolistas configuradas en el detalle de la categoría
    const classifications = categoryDetail.classifications || [];
    if (classifications.length > 0) {
      if (!playerClassificationId) {
        throw new BadRequestException(
          `La categoría "${categoryDetail.categoryDescription || 'Categoría'}" de la edición de torneo tiene clasificaciones de futbolistas configuradas. Es obligatorio asignar una clasificación al jugador.`,
        );
      }

      const classConfig = classifications.find(
        (c) => c.playerClassificationId === playerClassificationId,
      );
      if (!classConfig) {
        throw new BadRequestException(
          `La clasificación de futbolista seleccionada no está habilitada para la categoría "${categoryDetail.categoryDescription || 'Categoría'}".`,
        );
      }

      const qbClass = repository
        .createQueryBuilder('pr')
        .where('pr.teamRegistrationId = :teamRegistrationId', { teamRegistrationId })
        .andWhere('pr.playerClassificationId = :playerClassificationId', { playerClassificationId })
        .andWhere('pr.status != :finalizedStatus', { finalizedStatus: PlayerRegistrationStatus.FINALIZED_BY_TRANSFER });

      if (currentRegistrationId) {
        qbClass.andWhere('pr.id != :currentRegistrationId', { currentRegistrationId });
      }

      const currentClassCount = await qbClass.getCount();
      if (currentClassCount >= classConfig.maxPlayers) {
        const desc = classConfig.playerClassification?.description || 'Seleccionada';
        throw new BadRequestException(
          `Cupo agotado para la clasificación "${desc}": El equipo "${teamRegistration.team?.name || 'Club'}" ya cuenta con ${currentClassCount} de los ${classConfig.maxPlayers} cupos permitidos en esta categoría.`,
        );
      }
    }
  }

  async list(companyId: number, query: { page?: number; limit?: number; search?: string; teamRegistrationId?: string; status?: string }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const qb = this.repo
      .createQueryBuilder('pr')
      .leftJoinAndSelect('pr.teamRegistration', 'teamRegistration')
      .leftJoinAndSelect('teamRegistration.team', 'team')
      .leftJoinAndSelect('pr.player', 'player')
      .leftJoinAndSelect('player.demarcation', 'demarcation')
      .leftJoinAndSelect('pr.playerClassification', 'playerClassification')
      .leftJoinAndSelect('pr.stage', 'stage');

    if (companyId) {
      qb.andWhere('(pr.companyId = :companyId OR pr.companyId IS NULL)', { companyId });
    }
    if (query.teamRegistrationId) {
      qb.andWhere('pr.teamRegistrationId = :teamRegistrationId', { teamRegistrationId: query.teamRegistrationId });
    }
    if (query.status) {
      qb.andWhere('pr.status = :status', { status: query.status });
    }
    if (query.search?.trim()) {
      qb.andWhere(
        '(LOWER(player.name) LIKE :term OR LOWER(player.lastName) LIKE :term OR LOWER(pr.carnetCode) LIKE :term OR LOWER(playerClassification.description) LIKE :term)',
        {
          term: `%${query.search.trim().toLowerCase()}%`,
        },
      );
    }

    qb.orderBy('pr.createdAt', 'DESC').skip(skip).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async get(id: string) {
    const item = await this.repo.findOne({
      where: { id },
      relations: [
        'teamRegistration',
        'teamRegistration.team',
        'player',
        'player.demarcation',
        'playerClassification',
        'stage',
      ],
    });
    if (!item) throw new NotFoundException('Inscripción de jugador no encontrada');
    return item;
  }

  async create(dto: CreatePlayerRegistrationDto, user: any, companyId: number) {
    if (dto.playerId && dto.teamRegistrationId) {
      await this.validateDemarcationLimit(dto.playerId, dto.teamRegistrationId);
      await this.validateDuplicateAndJersey(dto.playerId, dto.teamRegistrationId, dto.jerseyNumber);
      await this.validateStageAndClassificationLimits(
        dto.teamRegistrationId,
        dto.playerClassificationId,
        dto.stageId,
      );
    }

    // Determinar estado inicial según configuración de torneo
    let initialStatus = dto.status || PlayerRegistrationStatus.ELIGIBLE;
    const teamReg = await this.teamRegistrationRepo.findOne({
      where: { id: dto.teamRegistrationId },
    });
    if (teamReg?.categoryEditionId) {
      const config = await this.transferConfigRepo.findOne({
        where: { editionId: teamReg.categoryEditionId },
      });
      if (config?.inscriptionsRequireApproval && !dto.status) {
        initialStatus = PlayerRegistrationStatus.PENDING_APPROVAL;
      }
    }

    const item = this.repo.create({
      ...dto,
      status: initialStatus,
      registrationDate: dto.registrationDate ? new Date(dto.registrationDate) : undefined,
      companyId,
      createdBy: user?.user_id?.toString() || user?.id?.toString(),
      createdName: user?.user_name || user?.name,
    });
    const saved = await this.repo.save(item);

    // Registrar historial de auditoría
    await this.historyRepo.save({
      playerRegistrationId: saved.id,
      playerId: saved.playerId,
      action: PlayerRegistrationHistoryAction.CREATED,
      newStatus: saved.status,
      performedById: user?.user_id?.toString() || user?.id?.toString(),
      performedByName: user?.user_name || user?.name,
      comments: 'Inscripción individual registrada',
      metadata: { jerseyNumber: saved.jerseyNumber, teamRegistrationId: saved.teamRegistrationId },
    });

    return saved;
  }

  /**
   * Inscripción Masiva Atómica mediante Transacción
   */
  async createMass(dto: MassPlayerRegistrationDto, user: any, companyId: number) {
    if (!dto.registrations || dto.registrations.length === 0) {
      throw new BadRequestException('Debe incluir al menos un jugador para la inscripción masiva');
    }

    const teamRegistration = await this.teamRegistrationRepo.findOne({
      where: { id: dto.teamRegistrationId },
      relations: ['team', 'categoryEdition'],
    });
    if (!teamRegistration) {
      throw new NotFoundException('Inscripción de equipo no encontrada');
    }

    // Validar configuración de torneo
    if (teamRegistration.categoryEditionId) {
      const config = await this.transferConfigRepo.findOne({
        where: { editionId: teamRegistration.categoryEditionId },
      });
      if (config) {
        if (!config.inscriptionsEnabled) {
          throw new BadRequestException('El período de inscripciones se encuentra cerrado.');
        }
        if (!config.allowMassInscription) {
          throw new BadRequestException('La inscripción masiva está deshabilitada para este campeonato.');
        }
      }
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const createdRecords: PlayerRegistrationOrmEntity[] = [];

    try {
      const runnerRepo = queryRunner.manager.getRepository(PlayerRegistrationOrmEntity);
      const historyRunnerRepo = queryRunner.manager.getRepository(PlayerRegistrationHistoryOrmEntity);

      // Determinar si requiere aprobación
      let initialStatus = PlayerRegistrationStatus.ELIGIBLE;
      if (teamRegistration.categoryEditionId) {
        const config = await this.transferConfigRepo.findOne({
          where: { editionId: teamRegistration.categoryEditionId },
        });
        if (config?.inscriptionsRequireApproval) {
          initialStatus = PlayerRegistrationStatus.PENDING_APPROVAL;
        }
      }

      for (const reg of dto.registrations) {
        await this.validateDemarcationLimit(reg.playerId, dto.teamRegistrationId, undefined, runnerRepo);
        await this.validateDuplicateAndJersey(reg.playerId, dto.teamRegistrationId, reg.jerseyNumber, undefined, runnerRepo);
        await this.validateStageAndClassificationLimits(
          dto.teamRegistrationId,
          reg.playerClassificationId,
          dto.stageId,
          undefined,
          runnerRepo,
        );

        const record = runnerRepo.create({
          teamRegistrationId: dto.teamRegistrationId,
          stageId: dto.stageId,
          playerId: reg.playerId,
          jerseyNumber: reg.jerseyNumber,
          carnetCode: reg.carnetCode,
          playerClassificationId: reg.playerClassificationId,
          isCaptain: Boolean(reg.isCaptain),
          documents: reg.documents || [],
          status: initialStatus,
          companyId,
          createdBy: user?.user_id?.toString() || user?.id?.toString(),
          createdName: user?.user_name || user?.name,
        });

        const saved = await runnerRepo.save(record);
        createdRecords.push(saved);

        await historyRunnerRepo.save({
          playerRegistrationId: saved.id,
          playerId: saved.playerId,
          action: PlayerRegistrationHistoryAction.MASS_CREATED,
          newStatus: saved.status,
          performedById: user?.user_id?.toString() || user?.id?.toString(),
          performedByName: user?.user_name || user?.name,
          comments: 'Inscripción procesada mediante carga masiva',
          metadata: { jerseyNumber: saved.jerseyNumber, teamRegistrationId: dto.teamRegistrationId },
        });
      }

      await queryRunner.commitTransaction();
      return {
        message: `Se han inscrito exitosamente ${createdRecords.length} jugador(es) en la nómina oficial.`,
        count: createdRecords.length,
        data: createdRecords,
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async update(id: string, dto: UpdatePlayerRegistrationDto, user: any) {
    const item = await this.get(id);

    const targetPlayerId = dto.playerId || item.playerId;
    const targetTeamRegId = dto.teamRegistrationId || item.teamRegistrationId;
    const targetClassificationId =
      dto.playerClassificationId !== undefined ? dto.playerClassificationId : item.playerClassificationId;
    const targetStageId = dto.stageId !== undefined ? dto.stageId : item.stageId;

    if (targetPlayerId && targetTeamRegId) {
      await this.validateDemarcationLimit(targetPlayerId, targetTeamRegId, id);
      const targetJersey = dto.jerseyNumber !== undefined ? dto.jerseyNumber : item.jerseyNumber;
      await this.validateDuplicateAndJersey(targetPlayerId, targetTeamRegId, targetJersey, id);
      await this.validateStageAndClassificationLimits(
        targetTeamRegId,
        targetClassificationId,
        targetStageId,
        id,
      );
    }

    const previousStatus = item.status;
    Object.assign(item, dto, {
      registrationDate: dto.registrationDate ? new Date(dto.registrationDate) : item.registrationDate,
      updatedBy: user?.user_id?.toString() || user?.id?.toString(),
      updateName: user?.user_name || user?.name,
    });
    const saved = await this.repo.save(item);

    if (dto.status && dto.status !== previousStatus) {
      await this.historyRepo.save({
        playerRegistrationId: saved.id,
        playerId: saved.playerId,
        action: PlayerRegistrationHistoryAction.STATUS_CHANGE,
        previousStatus,
        newStatus: saved.status,
        performedById: user?.user_id?.toString() || user?.id?.toString(),
        performedByName: user?.user_name || user?.name,
        comments: 'Estado modificado en edición de registro',
      });
    }

    return saved;
  }

  /**
   * Transición de estados de inscripción con trazabilidad y auditoría
   */
  async updateStatus(id: string, dto: UpdatePlayerRegistrationStatusDto, user: any) {
    const item = await this.get(id);
    const previousStatus = item.status;

    item.status = dto.status;
    item.updatedBy = user?.user_id?.toString() || user?.id?.toString();
    item.updateName = user?.user_name || user?.name;
    const saved = await this.repo.save(item);

    let action = PlayerRegistrationHistoryAction.STATUS_CHANGE;
    if (dto.status === PlayerRegistrationStatus.ELIGIBLE && previousStatus === PlayerRegistrationStatus.PENDING_APPROVAL) {
      action = PlayerRegistrationHistoryAction.APPROVED;
    } else if (dto.status === PlayerRegistrationStatus.SUSPENDED) {
      action = PlayerRegistrationHistoryAction.SUSPENDED;
    } else if (dto.status === PlayerRegistrationStatus.ELIGIBLE && previousStatus === PlayerRegistrationStatus.SUSPENDED) {
      action = PlayerRegistrationHistoryAction.REACTIVATED;
    } else if (dto.status === PlayerRegistrationStatus.INELIGIBLE) {
      action = PlayerRegistrationHistoryAction.REJECTED;
    }

    await this.historyRepo.save({
      playerRegistrationId: saved.id,
      playerId: saved.playerId,
      action,
      previousStatus,
      newStatus: saved.status,
      performedById: user?.user_id?.toString() || user?.id?.toString(),
      performedByName: user?.user_name || user?.name,
      comments: dto.comments || `Cambio de estado a ${dto.status}`,
    });

    return saved;
  }

  /**
   * Obtiene la plantilla completa y el balance de cupos ocupados vs disponibles
   */
  async getRosterByTeamRegistration(teamRegistrationId: string) {
    const teamReg = await this.teamRegistrationRepo.findOne({
      where: { id: teamRegistrationId },
      relations: ['team', 'categoryEdition', 'categoryEdition.category'],
    });
    if (!teamReg) {
      throw new NotFoundException('Inscripción de equipo no encontrada');
    }

    const registrations = await this.repo.find({
      where: { teamRegistrationId },
      relations: ['player', 'player.demarcation', 'playerClassification', 'stage'],
      order: { jerseyNumber: 'ASC' },
    });

    // Cupos y clasificaciones configuradas en la edición de torneo
    const categoryDetails = await this.editionCategoryDetailRepo.find({
      where: { editionId: teamReg.categoryEditionId },
      relations: ['classifications', 'classifications.playerClassification'],
    });

    const categoryDetail = categoryDetails[0] || null;
    const maxGeneralPlayers = categoryDetail ? Number(categoryDetail.maxPlayers) || 25 : 25;
    const activeRegistrations = registrations.filter(
      (r) => r.status !== PlayerRegistrationStatus.FINALIZED_BY_TRANSFER,
    );

    const classificationStats = (categoryDetail?.classifications || []).map((c) => {
      const current = activeRegistrations.filter((r) => r.playerClassificationId === c.playerClassificationId).length;
      const max = Number(c.maxPlayers) || 0;
      return {
        playerClassificationId: c.playerClassificationId,
        description: c.playerClassification?.description || 'Clasificación',
        code: c.playerClassification?.code,
        maxAllowed: max,
        currentCount: current,
        available: Math.max(0, max - current),
      };
    });

    return {
      teamRegistration: teamReg,
      totalActive: activeRegistrations.length,
      maxGeneralPlayers,
      availableGeneralSlots: Math.max(0, maxGeneralPlayers - activeRegistrations.length),
      classificationStats,
      players: registrations,
    };
  }

  async remove(id: string) {
    const item = await this.get(id);
    return this.repo.remove(item);
  }
}
