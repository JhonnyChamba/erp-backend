import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlayerRegistrationOrmEntity } from '../../infrastructure/persistence/player-registration.orm-entity';
import { PlayerOrmEntity } from '../../infrastructure/persistence/player.orm-entity';
import { CreatePlayerRegistrationDto, UpdatePlayerRegistrationDto } from './dto/player-registration.dto';

@Injectable()
export class PlayerRegistrationsService {
  constructor(
    @InjectRepository(PlayerRegistrationOrmEntity)
    private readonly repo: Repository<PlayerRegistrationOrmEntity>,
    @InjectRepository(PlayerOrmEntity)
    private readonly playerRepo: Repository<PlayerOrmEntity>,
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

  private async validateDuplicateAndJersey(playerId: string, teamRegistrationId: string, jerseyNumber?: number, currentRegistrationId?: string) {
    if (!teamRegistrationId) return;

    // 1. Validar que el jugador no esté inscrito dos veces en el mismo equipo/edición
    if (playerId) {
      const qbPlayer = this.repo.createQueryBuilder('pr')
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
      const qbJersey = this.repo.createQueryBuilder('pr')
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

  async list(companyId: number, query: { page?: number; limit?: number; search?: string }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const qb = this.repo
      .createQueryBuilder('pr')
      .leftJoinAndSelect('pr.teamRegistration', 'teamRegistration')
      .leftJoinAndSelect('teamRegistration.team', 'team')
      .leftJoinAndSelect('pr.player', 'player')
      .leftJoinAndSelect('player.demarcation', 'demarcation');

    if (companyId) {
      qb.andWhere('(pr.companyId = :companyId OR pr.companyId IS NULL)', { companyId });
    }
    if (query.search?.trim()) {
      qb.andWhere('(LOWER(player.name) LIKE :term OR LOWER(player.lastName) LIKE :term OR LOWER(pr.carnetCode) LIKE :term)', {
        term: `%${query.search.trim().toLowerCase()}%`,
      });
    }

    qb.orderBy('pr.createdAt', 'DESC').skip(skip).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async get(id: string) {
    const item = await this.repo.findOne({
      where: { id },
      relations: ['teamRegistration', 'teamRegistration.team', 'player', 'player.demarcation'],
    });
    if (!item) throw new NotFoundException('Inscripción de jugador no encontrada');
    return item;
  }

  async create(dto: CreatePlayerRegistrationDto, user: any, companyId: number) {
    if (dto.playerId && dto.teamRegistrationId) {
      await this.validateDemarcationLimit(dto.playerId, dto.teamRegistrationId);
      await this.validateDuplicateAndJersey(dto.playerId, dto.teamRegistrationId, dto.jerseyNumber);
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

    if (targetPlayerId && targetTeamRegId) {
      await this.validateDemarcationLimit(targetPlayerId, targetTeamRegId, id);
      const targetJersey = dto.jerseyNumber !== undefined ? dto.jerseyNumber : item.jerseyNumber;
      await this.validateDuplicateAndJersey(targetPlayerId, targetTeamRegId, targetJersey, id);
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
