import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { PlayerTransferOrmEntity } from '../../infrastructure/persistence/player-transfer.orm-entity';
import { PlayerTransferApprovalOrmEntity } from '../../infrastructure/persistence/player-transfer-approval.orm-entity';
import { PlayerOrmEntity } from '../../infrastructure/persistence/player.orm-entity';
import { TeamOrmEntity } from '../../infrastructure/persistence/team.orm-entity';
import { TeamRegistrationOrmEntity } from '../../infrastructure/persistence/team-registration.orm-entity';
import { PlayerRegistrationOrmEntity } from '../../infrastructure/persistence/player-registration.orm-entity';
import { TournamentTransferConfigOrmEntity } from '../../infrastructure/persistence/tournament-transfer-config.orm-entity';
import { PlayerRegistrationHistoryOrmEntity } from '../../infrastructure/persistence/player-registration-history.orm-entity';
import { EditionCategoryDetailOrmEntity } from '../../infrastructure/persistence/edition-category-detail.orm-entity';
import { CategoryEditionOrmEntity } from '../../infrastructure/persistence/category-edition.orm-entity';
import { StageOrmEntity } from '../../infrastructure/persistence/stage.orm-entity';
import { assertBelongsToCompany, assertPlayerInCompany, ensureCompanyScope, resolveUserId } from '../../common/company-scope.util';
import {
  TransferStatus,
  TransferApprovalRole,
  TransferApprovalStatus,
  PlayerRegistrationStatus,
  PlayerRegistrationHistoryAction,
} from '../../common/enum/campeonato.enum';
import {
  CreatePlayerTransferDto,
  ApproveTransferDto,
  FilterTransferQueryDto,
} from './dto/player-transfer.dto';

@Injectable()
export class PlayerTransfersService {
  constructor(
    @InjectRepository(PlayerTransferOrmEntity)
    private readonly repo: Repository<PlayerTransferOrmEntity>,
    @InjectRepository(PlayerTransferApprovalOrmEntity)
    private readonly approvalRepo: Repository<PlayerTransferApprovalOrmEntity>,
    @InjectRepository(PlayerOrmEntity)
    private readonly playerRepo: Repository<PlayerOrmEntity>,
    @InjectRepository(TeamOrmEntity)
    private readonly teamRepo: Repository<TeamOrmEntity>,
    @InjectRepository(TeamRegistrationOrmEntity)
    private readonly teamRegistrationRepo: Repository<TeamRegistrationOrmEntity>,
    @InjectRepository(PlayerRegistrationOrmEntity)
    private readonly playerRegistrationRepo: Repository<PlayerRegistrationOrmEntity>,
    @InjectRepository(TournamentTransferConfigOrmEntity)
    private readonly transferConfigRepo: Repository<TournamentTransferConfigOrmEntity>,
    @InjectRepository(PlayerRegistrationHistoryOrmEntity)
    private readonly historyRepo: Repository<PlayerRegistrationHistoryOrmEntity>,
    @InjectRepository(EditionCategoryDetailOrmEntity)
    private readonly editionCategoryDetailRepo: Repository<EditionCategoryDetailOrmEntity>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Crear solicitud de transferencia con detección automática del equipo de origen
   */
  async createRequest(dto: CreatePlayerTransferDto, user: any, companyId: number) {
    const player = await this.playerRepo.findOne({ where: { id: dto.playerId } });
    if (!player) throw new NotFoundException('Jugador no encontrado en el sistema');

    // 0. Los ids del body deben pertenecer a la empresa activa
    await assertBelongsToCompany(this.repo.manager.getRepository(CategoryEditionOrmEntity), dto.editionId, companyId, 'Edición de torneo no encontrada');
    await assertBelongsToCompany(this.teamRepo, dto.destinationTeamId, companyId, 'Equipo de destino no encontrado');
    await assertBelongsToCompany(this.teamRepo, dto.passOwnerTeamId, companyId, 'Equipo dueño del pase no encontrado');
    await assertBelongsToCompany(this.repo.manager.getRepository(StageOrmEntity), dto.stageId, companyId, 'Etapa no encontrada');

    const destinationTeamRegistration = await this.teamRegistrationRepo.findOne({
      where: dto.destinationTeamRegistrationId
        ? { id: Number(dto.destinationTeamRegistrationId) }
        : { teamId: Number(dto.destinationTeamId), categoryEditionId: Number(dto.editionId) },
    });
    if (
      !destinationTeamRegistration ||
      Number(destinationTeamRegistration.teamId) !== Number(dto.destinationTeamId) ||
      Number(destinationTeamRegistration.categoryEditionId) !== Number(dto.editionId)
    ) {
      throw new BadRequestException('El equipo de destino no cuenta con una inscripción en este campeonato.');
    }
    ensureCompanyScope(destinationTeamRegistration, companyId, 'Inscripción del equipo de destino no encontrada');

    // 1. Validar reglas de la edición de torneo
    const config = await this.transferConfigRepo.findOne({ where: { editionId: dto.editionId } });
    if (config) {
      if (!config.transfersEnabled) {
        throw new BadRequestException('El período de transferencias se encuentra cerrado para este campeonato.');
      }
      const now = new Date();
      if (config.transfersStartDate && new Date(config.transfersStartDate) > now) {
        throw new BadRequestException(`El período de transferencias inicia el ${new Date(config.transfersStartDate).toLocaleDateString()}.`);
      }
      if (config.transfersEndDate && new Date(config.transfersEndDate) < now) {
        throw new BadRequestException(`El período de transferencias finalizó el ${new Date(config.transfersEndDate).toLocaleDateString()}.`);
      }

      // Validar máximo de transferencias por jugador en este torneo
      const transfersCount = await this.repo.count({
        where: {
          playerId: dto.playerId,
          editionId: dto.editionId,
          status: TransferStatus.EXECUTED,
        },
      });
      if (transfersCount >= (config.maxTransfersPerPlayer || 2)) {
        throw new BadRequestException(
          `Límite alcanzado: El futbolista ya ha alcanzado el número máximo de transferencias permitidas (${config.maxTransfersPerPlayer}) para este campeonato.`,
        );
      }
    }

    // 2. Detectar AUTOMÁTICAMENTE la inscripción vigente activa del jugador en este campeonato
    const activeRegistration = await this.playerRegistrationRepo
      .createQueryBuilder('pr')
      .leftJoinAndSelect('pr.teamRegistration', 'tr')
      .leftJoinAndSelect('tr.team', 'team')
      .where('pr.playerId = :playerId', { playerId: dto.playerId })
      .andWhere('tr.categoryEditionId = :editionId', { editionId: dto.editionId })
      .andWhere('(pr.companyId = :companyId OR pr.companyId IS NULL)', { companyId })
      .andWhere('pr.status != :finalizedStatus', { finalizedStatus: PlayerRegistrationStatus.FINALIZED_BY_TRANSFER })
      .getOne();

    if (!activeRegistration) {
      throw new BadRequestException(
        `El jugador ${player.name} ${player.lastName} no cuenta con una inscripción vigente en ningún equipo de este campeonato. Para incorporarlo, debe registrar una inscripción regular.`,
      );
    }

    const originTeamId = activeRegistration.teamRegistration.teamId;

    if (originTeamId === dto.destinationTeamId) {
      throw new BadRequestException('El jugador ya pertenece y se encuentra inscrito en el equipo de destino seleccionado.');
    }

    // 3. Validar que no exista una solicitud de transferencia pendiente en curso para este jugador
    const pendingTransfer = await this.repo.findOne({
      where: {
        playerId: dto.playerId,
        editionId: dto.editionId,
        status: TransferStatus.PENDING_APPROVAL,
      },
    });
    if (pendingTransfer) {
      throw new BadRequestException('Ya existe una solicitud de transferencia en proceso de aprobación para este jugador.');
    }

    // 4. Crear la solicitud de transferencia
    const requiresApprovals = config
      ? config.requireOriginTeamApproval || config.requireDestinationTeamApproval || config.requireAdminApproval
      : true;

    const initialStatus = requiresApprovals ? TransferStatus.PENDING_APPROVAL : TransferStatus.APPROVED;

    const transfer = this.repo.create({
      ...dto,
      originTeamId,
      originRegistrationId: activeRegistration.id,
      companyId,
      status: initialStatus,
      requestDate: new Date(),
      transferDate: dto.transferDate ? new Date(dto.transferDate) : new Date(),
      passOwnerType: dto.passOwnerType || player.passOwnerType || 'PLAYER',
      passOwnerTeamId: dto.passOwnerType === 'TEAM' ? (dto.passOwnerTeamId || dto.destinationTeamId) : undefined,
      createdBy: user?.user_id?.toString() || user?.id?.toString(),
      createdName: user?.user_name || user?.name,
    });

    const savedTransfer = await this.repo.save(transfer);

    // 5. Generar las aprobaciones requeridas según la configuración
    const approvalsToCreate: Partial<PlayerTransferApprovalOrmEntity>[] = [];
    if (!config || config.requireOriginTeamApproval) {
      approvalsToCreate.push({
        transferId: savedTransfer.id,
        role: TransferApprovalRole.ORIGIN_TEAM,
        status: TransferApprovalStatus.PENDING,
      });
    }
    if (!config || config.requireDestinationTeamApproval) {
      approvalsToCreate.push({
        transferId: savedTransfer.id,
        role: TransferApprovalRole.DESTINATION_TEAM,
        status: TransferApprovalStatus.APPROVED, // El equipo que solicita aprueba automáticamente su petición
        approverUserId: resolveUserId(user),
        approverName: user?.user_name || user?.name,
        actionDate: new Date(),
        comments: 'Solicitud formal emitida por el club destino',
      });
    }
    if (!config || config.requireAdminApproval) {
      approvalsToCreate.push({
        transferId: savedTransfer.id,
        role: TransferApprovalRole.ADMIN,
        status: TransferApprovalStatus.PENDING,
      });
    }

    if (approvalsToCreate.length > 0) {
      await this.approvalRepo.save(approvalsToCreate);
    }

    return this.get(savedTransfer.id, companyId);
  }

  /**
   * Aprobar o rechazar una solicitud de transferencia por rol
   */
  async approve(transferId: string | number, dto: ApproveTransferDto, user: any, companyId: number) {
    const transfer = ensureCompanyScope(
      await this.repo.findOne({
        where: { id: Number(transferId) },
        relations: ['approvals', 'player', 'originTeam', 'destinationTeam'],
      }),
      companyId,
      'Solicitud de transferencia no encontrada',
      true,
    );

    if (transfer.status !== TransferStatus.PENDING_APPROVAL) {
      throw new BadRequestException(`No se puede modificar una transferencia en estado "${transfer.status}".`);
    }

    let approval = transfer.approvals.find((a) => a.role === dto.role);
    if (!approval) {
      approval = this.approvalRepo.create({
        transferId: transfer.id,
        role: dto.role,
      });
    }

    approval.status = dto.status;
    approval.actionDate = new Date();
    approval.approverUserId = resolveUserId(user);
    approval.approverName = user?.user_name || user?.name;
    approval.comments = dto.comments || (dto.status === TransferApprovalStatus.APPROVED ? 'Aprobado satisfactoriamente' : 'Rechazado');
    await this.approvalRepo.save(approval);

    // Si fue rechazada, marcar la transferencia inmediatamente como REJECTED
    if (dto.status === TransferApprovalStatus.REJECTED) {
      transfer.status = TransferStatus.REJECTED;
      transfer.rejectionReason = `Rechazado por ${dto.role}: ${dto.comments || 'Sin motivo especificado'}`;
      transfer.updatedBy = user?.user_id?.toString() || user?.id?.toString();
      transfer.updateName = user?.user_name || user?.name;
      await this.repo.save(transfer);
      return this.get(transfer.id, companyId);
    }

    // Verificar si todas las aprobaciones obligatorias ya están en APPROVED
    const updatedApprovals = await this.approvalRepo.find({ where: { transferId: Number(transfer.id) } });
    const allApproved = updatedApprovals.every((a) => a.status === TransferApprovalStatus.APPROVED);

    if (allApproved) {
      transfer.status = TransferStatus.APPROVED;
      transfer.updatedBy = user?.user_id?.toString() || user?.id?.toString();
      transfer.updateName = user?.user_name || user?.name;
      await this.repo.save(transfer);
    }

    return this.get(transfer.id, companyId);
  }

  /**
   * Ejecución atómica transaccional de la transferencia
   */
  async execute(transferId: string | number, user: any, companyId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const transferRepo = queryRunner.manager.getRepository(PlayerTransferOrmEntity);
      const playerRepo = queryRunner.manager.getRepository(PlayerOrmEntity);
      const playerRegRepo = queryRunner.manager.getRepository(PlayerRegistrationOrmEntity);
      const teamRegRepo = queryRunner.manager.getRepository(TeamRegistrationOrmEntity);
      const detailRepo = queryRunner.manager.getRepository(EditionCategoryDetailOrmEntity);
      const historyRepo = queryRunner.manager.getRepository(PlayerRegistrationHistoryOrmEntity);

      // 1. Obtener transferencia y validar estado
      const transfer = ensureCompanyScope(
        await transferRepo.findOne({
          where: { id: Number(transferId) },
          relations: ['approvals', 'player', 'originRegistration', 'destinationTeam'],
        }),
        companyId,
        'Transferencia no encontrada',
        true,
      );

      if (transfer.status === TransferStatus.EXECUTED) {
        throw new BadRequestException('Esta transferencia ya fue ejecutada previamente.');
      }
      if (transfer.status !== TransferStatus.APPROVED) {
        throw new BadRequestException('La transferencia debe contar con todas las aprobaciones requeridas antes de ejecutarse.');
      }

      // 2. Confirmar que el jugador sigue inscrito y activo en el equipo de origen
      const originReg = transfer.originRegistrationId
        ? await playerRegRepo.findOne({ where: { id: transfer.originRegistrationId } })
        : null;
      if (!originReg || originReg.status === PlayerRegistrationStatus.FINALIZED_BY_TRANSFER) {
        throw new BadRequestException('La inscripción de origen del futbolista ya no se encuentra activa.');
      }

      // 3. Inscripción del equipo destino en esta edición. Se resuelve siempre por equipo + edición:
      // transfer.destinationRegistrationId es la inscripción del JUGADOR en destino (se crea en el paso 6),
      // no un id de inscripción de equipo, y un where con id undefined devolvería la primera fila de la tabla.
      const targetTeamReg =
        transfer.destinationTeamId && transfer.editionId
          ? await teamRegRepo.findOne({
              where: {
                teamId: transfer.destinationTeamId,
                categoryEditionId: transfer.editionId,
              },
            })
          : null;
      if (!targetTeamReg) {
        throw new BadRequestException('El equipo de destino no cuenta con una inscripción activa en este campeonato.');
      }

      // 4. Validar cupos generales y cupos por clasificación en equipo destino
      const categoryDetails = await detailRepo.find({
        where: { editionId: transfer.editionId },
        relations: ['classifications', 'classifications.playerClassification'],
      });
      const categoryDetail = categoryDetails[0] || null;

      if (categoryDetail && categoryDetail.maxPlayers > 0) {
        const currentTotal = await playerRegRepo
          .createQueryBuilder('pr')
          .setLock('pessimistic_write')
          .where('pr.teamRegistrationId = :teamRegistrationId', { teamRegistrationId: targetTeamReg.id })
          .andWhere('pr.status != :finalizedStatus', { finalizedStatus: PlayerRegistrationStatus.FINALIZED_BY_TRANSFER })
          .getCount();

        if (currentTotal >= categoryDetail.maxPlayers) {
          throw new BadRequestException(
            `El equipo destino ya ha alcanzado el límite máximo de ${categoryDetail.maxPlayers} jugadores inscritos. No es posible incorporar más futbolistas.`,
          );
        }
      }

      // Validar cupo de clasificación
      const classificationId = originReg.playerClassificationId;
      if (categoryDetail && classificationId && categoryDetail.classifications?.length) {
        const classConfig = categoryDetail.classifications.find((c) => c.playerClassificationId === classificationId);
        if (classConfig && classConfig.maxPlayers > 0) {
          const currentClassCount = await playerRegRepo
            .createQueryBuilder('pr')
            .setLock('pessimistic_write')
            .where('pr.teamRegistrationId = :teamRegistrationId', { teamRegistrationId: targetTeamReg.id })
            .andWhere('pr.playerClassificationId = :classificationId', { classificationId })
            .andWhere('pr.status != :finalizedStatus', { finalizedStatus: PlayerRegistrationStatus.FINALIZED_BY_TRANSFER })
            .getCount();

          if (currentClassCount >= classConfig.maxPlayers) {
            throw new BadRequestException(
              `Cupo agotado en equipo destino: La clasificación del jugador ya alcanzó el cupo máximo permitido (${classConfig.maxPlayers}).`,
            );
          }
        }
      }

      // 5. Finalizar la inscripción anterior
      const previousStatus = originReg.status;
      originReg.status = PlayerRegistrationStatus.FINALIZED_BY_TRANSFER;
      originReg.updatedBy = user?.user_id?.toString() || user?.id?.toString();
      originReg.updateName = user?.user_name || user?.name;
      await playerRegRepo.save(originReg);

      await historyRepo.save({
        playerRegistrationId: originReg.id,
        playerId: transfer.playerId,
        action: PlayerRegistrationHistoryAction.FINALIZED,
        previousStatus,
        newStatus: PlayerRegistrationStatus.FINALIZED_BY_TRANSFER,
        performedById: resolveUserId(user),
        performedByName: user?.user_name || user?.name,
        comments: `Inscripción cerrada por transferencia hacia ${transfer.destinationTeam?.name || 'nuevo club'}`,
      });

      // 6. Crear la nueva inscripción en el equipo de destino
      const newRegistration = playerRegRepo.create({
        teamRegistrationId: targetTeamReg.id,
        stageId: transfer.stageId || originReg.stageId,
        playerId: transfer.playerId,
        playerClassificationId: classificationId,
        jerseyNumber: originReg.jerseyNumber || 1,
        carnetCode: originReg.carnetCode,
        status: PlayerRegistrationStatus.ELIGIBLE,
        companyId: transfer.companyId,
        isCaptain: false,
        documents: transfer.documents || [],
        createdBy: user?.user_id?.toString() || user?.id?.toString(),
        createdName: user?.user_name || user?.name,
      });
      const savedNewReg = await playerRegRepo.save(newRegistration);

      await historyRepo.save({
        playerRegistrationId: savedNewReg.id,
        playerId: transfer.playerId,
        action: PlayerRegistrationHistoryAction.TRANSFERRED,
        newStatus: PlayerRegistrationStatus.ELIGIBLE,
        performedById: resolveUserId(user),
        performedByName: user?.user_name || user?.name,
        comments: `Inscripción dada de alta mediante ejecución de transferencia #${transfer.id}`,
      });

      // 7. Asociar la nueva inscripción y actualizar la transferencia como EXECUTED
      transfer.destinationRegistrationId = savedNewReg.id;
      transfer.status = TransferStatus.EXECUTED;
      transfer.executionDate = new Date();
      transfer.updatedBy = user?.user_id?.toString() || user?.id?.toString();
      transfer.updateName = user?.user_name || user?.name;
      await transferRepo.save(transfer);

      // 8. Actualizar perfil del jugador
      await playerRepo.update(transfer.playerId, {
        currentTeamId: transfer.destinationTeamId,
        passOwnerType: transfer.passOwnerType,
        passOwnerTeamId: transfer.passOwnerType === 'TEAM' ? (transfer.passOwnerTeamId || transfer.destinationTeamId) : (null as any),
      });

      await queryRunner.commitTransaction();
      return this.get(transfer.id, companyId);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async list(companyId: number, query: FilterTransferQueryDto) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const qb = this.repo
      .createQueryBuilder('pt')
      .leftJoinAndSelect('pt.player', 'player')
      .leftJoinAndSelect('pt.originTeam', 'originTeam')
      .leftJoinAndSelect('pt.destinationTeam', 'destinationTeam')
      .leftJoinAndSelect('pt.passOwnerTeam', 'passOwnerTeam')
      .leftJoinAndSelect('pt.edition', 'edition')
      .leftJoinAndSelect('pt.stage', 'stage')
      .leftJoinAndSelect('pt.approvals', 'approvals');

    if (companyId) {
      qb.andWhere('(pt.companyId = :companyId OR pt.companyId IS NULL)', { companyId });
    }
    if (query.editionId) {
      qb.andWhere('pt.editionId = :editionId', { editionId: query.editionId });
    }
    if (query.status) {
      qb.andWhere('pt.status = :status', { status: query.status });
    }
    if (query.originTeamId) {
      qb.andWhere('pt.originTeamId = :originTeamId', { originTeamId: query.originTeamId });
    }
    if (query.destinationTeamId) {
      qb.andWhere('pt.destinationTeamId = :destinationTeamId', { destinationTeamId: query.destinationTeamId });
    }
    if (query.playerId) {
      qb.andWhere('pt.playerId = :playerId', { playerId: query.playerId });
    }
    if (query.search?.trim()) {
      qb.andWhere(
        '(LOWER(player.name) LIKE :term OR LOWER(player.lastName) LIKE :term OR LOWER(originTeam.name) LIKE :term OR LOWER(destinationTeam.name) LIKE :term)',
        { term: `%${query.search.trim().toLowerCase()}%` },
      );
    }

    qb.orderBy('pt.createdAt', 'DESC').skip(skip).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async get(id: string | number, companyId: number) {
    const item = await this.repo.findOne({
      where: { id: Number(id) },
      relations: [
        'player',
        'player.demarcation',
        'originTeam',
        'destinationTeam',
        'passOwnerTeam',
        'edition',
        'stage',
        'approvals',
      ],
    });
    return ensureCompanyScope(item, companyId, 'Transferencia no encontrada');
  }

  /**
   * Historial deportivo integral del futbolista (inscripciones, transferencias y trayectoria)
   */
  async getSportsHistory(playerId: string | number, companyId: number) {
    const numPlayerId = Number(playerId);
    // El historial solo se entrega a una empresa que tenga al jugador en su padrón
    await assertPlayerInCompany(this.repo.manager, numPlayerId, companyId);
    const player = await this.playerRepo.findOne({
      where: { id: numPlayerId },
      relations: ['demarcation', 'currentTeam', 'passOwnerTeam'],
    });
    if (!player) throw new NotFoundException('Jugador no encontrado');

    const registrations = await this.playerRegistrationRepo.find({
      where: { playerId: numPlayerId },
      relations: ['teamRegistration', 'teamRegistration.team', 'teamRegistration.categoryEdition', 'playerClassification', 'stage'],
      order: { registrationDate: 'DESC' },
    });

    const transfers = await this.repo.find({
      where: { playerId: numPlayerId },
      relations: ['originTeam', 'destinationTeam', 'edition', 'approvals'],
      order: { createdAt: 'DESC' },
    });

    const historyTimeline = await this.historyRepo.find({
      where: { playerId: numPlayerId },
      relations: ['playerRegistration'],
      order: { createdAt: 'DESC' },
    });

    return {
      player,
      registrations,
      transfers,
      timeline: historyTimeline,
    };
  }

  async listByPlayer(playerId: string | number, companyId: number) {
    const numPlayerId = Number(playerId);
    return this.repo.find({
      where: { playerId: numPlayerId, companyId },
      relations: ['player', 'originTeam', 'destinationTeam', 'passOwnerTeam', 'edition', 'approvals'],
      order: { createdAt: 'DESC' },
    });
  }

  async remove(id: string | number, companyId: number) {
    const item = ensureCompanyScope(
      await this.repo.findOne({ where: { id: Number(id) } }),
      companyId,
      'Transferencia no encontrada',
      true,
    );
    if (item.status === TransferStatus.EXECUTED) {
      throw new BadRequestException('No se puede eliminar una transferencia que ya fue ejecutada.');
    }
    return this.repo.remove(item);
  }
}
