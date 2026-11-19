import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MatchOrmEntity } from '../../infrastructure/persistence/match.orm-entity';
import { assertBelongsToCompany, ensureCompanyScope } from '../../common/company-scope.util';
import { SanctionOrmEntity } from '../../infrastructure/persistence/sanction.orm-entity';
import { CreateSanctionDto, UpdateSanctionDto } from './dto/sanction.dto';

@Injectable()
export class SanctionsService {
  constructor(
    @InjectRepository(SanctionOrmEntity)
    private readonly repo: Repository<SanctionOrmEntity>,
  ) {}

  async list(companyId: number, query: { page?: number; limit?: number; search?: string }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const qb = this.repo
      .createQueryBuilder('s')
      .leftJoinAndSelect('s.player', 'player')
      .leftJoinAndSelect('s.match', 'match');

    if (companyId) {
      qb.andWhere('(s.companyId = :companyId OR s.companyId IS NULL)', { companyId });
    }
    if (query.search?.trim()) {
      qb.andWhere('(LOWER(player.name) LIKE :term OR LOWER(player.lastName) LIKE :term OR LOWER(s.description) LIKE :term)', {
        term: `%${query.search.trim().toLowerCase()}%`,
      });
    }

    qb.orderBy('s.createdAt', 'DESC').skip(skip).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async get(id: string | number, companyId: number, write = false) {
    const item = await this.repo.findOne({ where: { id: Number(id) }, relations: ['player', 'match'] });
    return ensureCompanyScope(item, companyId, 'Sanción no encontrada', write);
  }

  async create(dto: CreateSanctionDto, user: any, companyId: number) {
    await assertBelongsToCompany(this.repo.manager.getRepository(MatchOrmEntity), dto.matchId, companyId, 'Partido no encontrado');
    const item = this.repo.create({
      ...dto,
      companyId,
      createdBy: user?.user_id?.toString() || user?.id?.toString(),
      createdName: user?.user_name || user?.name,
    });
    return this.repo.save(item);
  }

  async update(id: string | number, dto: UpdateSanctionDto, user: any, companyId: number) {
    const item = await this.get(id, companyId, true);
    await assertBelongsToCompany(this.repo.manager.getRepository(MatchOrmEntity), dto.matchId, companyId, 'Partido no encontrado');
    Object.assign(item, dto, {
      updatedBy: user?.user_id?.toString() || user?.id?.toString(),
      updateName: user?.user_name || user?.name,
    });
    return this.repo.save(item);
  }

  async remove(id: string | number, companyId: number) {
    const item = await this.get(id, companyId, true);
    return this.repo.remove(item);
  }
}
