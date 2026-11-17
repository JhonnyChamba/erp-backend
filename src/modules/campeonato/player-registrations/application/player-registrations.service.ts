import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlayerRegistrationOrmEntity } from '../../infrastructure/persistence/player-registration.orm-entity';
import { PlayerOrmEntity } from '../../infrastructure/persistence/player.orm-entity';
import { TeamRegistrationOrmEntity } from '../../infrastructure/persistence/team-registration.orm-entity';
import { StageOrmEntity } from '../../infrastructure/persistence/stage.orm-entity';
import { EditionCategoryDetailOrmEntity } from '../../infrastructure/persistence/edition-category-detail.orm-entity';
import { CreatePlayerRegistrationDto, UpdatePlayerRegistrationDto } from './dto/player-registration.dto';

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
  ) {}

  private async validateDemarcationLimit(playerId: string, teamRegistrationId: string, currentRegistrationId?: string) {
    if (!playerId || !teamRegistrationId) return;

    const player = await this.playerRepo.findOne({
      where: { id: playerId },
      relations: ['demarcation'],
    });

    if (!player || !player.demarcation) return;

    const demarcation = player.demarcation;
    const maxAllowed = Number(demarcation.maxPlayers);

    // Si maxPlayers es 0, null o indefinido, no hay límite
    if (!maxAllowed || maxAllowed <= 0) return;

    const qb = this.repo
      .createQueryBuilder('pr')
      .leftJoin('pr.player', 'p')
      .where('pr.teamRegistrationId = :teamRegistrationId', { teamRegistrationId })
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
  ) {
    if (!teamRegistrationId) return;

    // 1. Validar que el jugador no esté inscrito dos veces en el mismo equipo/edición
    if (playerId) {
      const qbPlayer = this.repo
        .createQueryBuilder('pr')
        .where('pr.teamRegistrationId = :teamRegistrationId', { teamRegistrationId })
        .andWhere('pr.playerId = :playerId', { playerId });
      if (currentRegistrationId) {
        qbPlayer.andWhere('pr.id != :currentRegistrationId', { currentRegistrationId });
      }
      const existingPlayer = await qbPlayer.getOne();
      if (existingPlayer) {
        throw new BadRequestException('El jugador ya se encuentra inscrito en la nómina de este equipo para esta edición del torneo.');
      }
    }

    // 2. Validar dorsal único por equipo
    if (jerseyNumber !== undefined && jerseyNumber !== null && Number(jerseyNumber) > 0) {
      const qbJersey = this.repo
        .createQueryBuilder('pr')
        .where('pr.teamRegistrationId = :teamRegistrationId', { teamRegistrationId })
        .andWhere('pr.jerseyNumber = :jerseyNumber', { jerseyNumber });
      if (currentRegistrationId) {
        qbJersey.andWhere('pr.id != :currentRegistrationId', { currentRegistrationId });
      }
      const existingJersey = await qbJersey.getOne();
      if (existingJersey) {
        throw new BadRequestException(`El número de dorsal #${jerseyNumber} ya está asignado a otro jugador en este equipo.`);
      }
    }
  }

  /**
   * Validación del límite máximo de jugadores inscritos por categoría de la edición de torneo
   * y control de cupos por clasificación de futbolistas.
   */
  private async validateStageAndClassificationLimits(
    teamRegistrationId: string,
    playerClassificationId?: string,
    stageId?: string,
    currentRegistrationId?: string,
  ) {
    if (!teamRegistrationId) return;

    const teamRegistration = await this.teamRegistrationRepo.findOne({
      where: { id: teamRegistrationId },
      relations: ['team', 'categoryEdition'],
    });

    if (!teamRegistration || !teamRegistration.categoryEditionId) return;

    // Buscar el detalle de categoría correspondiente para la edición de torneo
    const categoryDetails = await this.editionCategoryDetailRepo.find({
      where: { editionId: teamRegistration.categoryEditionId },
      relations: ['classifications', 'classifications.playerClassification'],
    });

    if (!categoryDetails || categoryDetails.length === 0) return;

    // Tomar el detalle de categoría de la edición
    const categoryDetail = categoryDetails[0];

    // 1. Validar límite máximo de jugadores inscritos por equipo en la categoría
    const maxPlayers = categoryDetail.maxPlayers;
    if (maxPlayers && maxPlayers > 0) {
      const qbTotal = this.repo
        .createQueryBuilder('pr')
        .where('pr.teamRegistrationId = :teamRegistrationId', { teamRegistrationId });

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

      const qbClass = this.repo
        .createQueryBuilder('pr')
        .where('pr.teamRegistrationId = :teamRegistrationId', { teamRegistrationId })
        .andWhere('pr.playerClassificationId = :playerClassificationId', { playerClassificationId });

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

  async list(companyId: number, query: { page?: number; limit?: number; search?: string }) {
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

    const item = this.repo.create({
      ...dto,
      registrationDate: dto.registrationDate ? new Date(dto.registrationDate) : undefined,
      companyId,
      createdBy: user?.user_id?.toString() || user?.id?.toString(),
      createdName: user?.user_name || user?.name,
    });
    return this.repo.save(item);
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

    Object.assign(item, dto, {
      registrationDate: dto.registrationDate ? new Date(dto.registrationDate) : item.registrationDate,
      updatedBy: user?.user_id?.toString() || user?.id?.toString(),
      updateName: user?.user_name || user?.name,
    });
    return this.repo.save(item);
  }

  async remove(id: string) {
    const item = await this.get(id);
    return this.repo.remove(item);
  }
}
