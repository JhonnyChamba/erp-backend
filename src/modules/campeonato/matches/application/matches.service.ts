import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MatchOrmEntity } from '../../infrastructure/persistence/match.orm-entity';
import { CreateMatchDto, UpdateMatchDto } from './dto/match.dto';

@Injectable()
export class MatchesService {
  constructor(
    @InjectRepository(MatchOrmEntity)
    private readonly repo: Repository<MatchOrmEntity>,
  ) {}

  async list(companyId: number, query: { page?: number; limit?: number; search?: string }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const qb = this.repo
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.stage', 'stage')
      .leftJoinAndSelect('m.scenary', 'scenary')
      .leftJoinAndSelect('m.localTeam', 'localTeam')
      .leftJoinAndSelect('m.awayTeam', 'awayTeam')
      .leftJoinAndSelect('m.referee', 'referee')
      .leftJoinAndSelect('m.vocal', 'vocal')
      .leftJoinAndSelect('m.vocalTeam', 'vocalTeam');

    if (companyId) {
      qb.andWhere('(m.companyId = :companyId OR m.companyId IS NULL)', { companyId });
    }
    if (query.search?.trim()) {
      qb.andWhere(
        '(LOWER(localTeam.name) LIKE :term OR LOWER(awayTeam.name) LIKE :term OR LOWER(m.llaveId) LIKE :term)',
        { term: `%${query.search.trim().toLowerCase()}%` },
      );
    }

    qb.orderBy('m.date', 'DESC').addOrderBy('m.createdAt', 'DESC').skip(skip).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async get(id: string) {
    const item = await this.repo.findOne({
      where: { id },
      relations: ['stage', 'scenary', 'localTeam', 'awayTeam', 'referee', 'vocal', 'vocalTeam'],
    });
    if (!item) throw new NotFoundException('Partido no encontrado');
    return item;
  }

  async create(dto: CreateMatchDto, user: any, companyId: number) {
    const item = this.repo.create({
      ...dto,
      date: new Date(dto.date),
      companyId,
      createdBy: user?.user_id?.toString() || user?.id?.toString(),
      createdName: user?.user_name || user?.name,
    });
    return this.repo.save(item);
  }

  async update(id: string, dto: UpdateMatchDto, user: any) {
    const item = await this.get(id);
    Object.assign(item, dto, {
      date: dto.date ? new Date(dto.date) : item.date,
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
