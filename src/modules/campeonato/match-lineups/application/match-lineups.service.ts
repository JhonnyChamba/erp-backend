import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MatchLineupOrmEntity } from '../../infrastructure/persistence/match-lineup.orm-entity';
import { CreateMatchLineupDto, UpdateMatchLineupDto } from './dto/match-lineup.dto';

@Injectable()
export class MatchLineupsService {
  constructor(
    @InjectRepository(MatchLineupOrmEntity)
    private readonly repo: Repository<MatchLineupOrmEntity>,
  ) {}

  async list(companyId: number, query: { page?: number; limit?: number; search?: string; matchId?: string }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const qb = this.repo
      .createQueryBuilder('ml')
      .leftJoinAndSelect('ml.match', 'match')
      .leftJoinAndSelect('ml.team', 'team')
      .leftJoinAndSelect('ml.player', 'player');

    if (companyId) {
      qb.andWhere('(ml.companyId = :companyId OR ml.companyId IS NULL)', { companyId });
    }
    if (query.matchId) {
      qb.andWhere('ml.matchId = :matchId', { matchId: query.matchId });
    }
    if (query.search?.trim()) {
      qb.andWhere('(LOWER(player.name) LIKE :term OR LOWER(player.lastName) LIKE :term OR LOWER(team.name) LIKE :term)', {
        term: `%${query.search.trim().toLowerCase()}%`,
      });
    }

    qb.orderBy('ml.createdAt', 'DESC').skip(skip).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async get(id: string | number) {
    const item = await this.repo.findOne({
      where: { id: Number(id) },
      relations: ['match', 'team', 'player'],
    });
    if (!item) throw new NotFoundException('Registro de alineación no encontrado');
    return item;
  }

  async create(dto: CreateMatchLineupDto, user: any, companyId: number) {
    const item = this.repo.create({
      ...dto,
      companyId,
      createdBy: user?.user_id?.toString() || user?.id?.toString(),
      createdName: user?.user_name || user?.name,
    });
    return this.repo.save(item);
  }

  async update(id: string | number, dto: UpdateMatchLineupDto, user: any) {
    const item = await this.get(id);
    Object.assign(item, dto, {
      updatedBy: user?.user_id?.toString() || user?.id?.toString(),
      updateName: user?.user_name || user?.name,
    });
    return this.repo.save(item);
  }

  async remove(id: string | number) {
    const item = await this.get(id);
    return this.repo.remove(item);
  }
}
