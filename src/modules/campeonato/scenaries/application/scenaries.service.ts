import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ensureCompanyScope } from '../../common/company-scope.util';
import { ScenaryOrmEntity } from '../../infrastructure/persistence/scenary.orm-entity';
import { CreateScenaryDto, UpdateScenaryDto } from './dto/scenary.dto';

@Injectable()
export class ScenariesService {
  constructor(
    @InjectRepository(ScenaryOrmEntity)
    private readonly repo: Repository<ScenaryOrmEntity>,
  ) {}

  async list(companyId: number, query: { page?: number; limit?: number; search?: string }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const qb = this.repo.createQueryBuilder('s');
    if (companyId) {
      qb.andWhere('(s.companyId = :companyId OR s.companyId IS NULL)', { companyId });
    }
    if (query.search?.trim()) {
      qb.andWhere('(LOWER(s.name) LIKE :term OR LOWER(s.location) LIKE :term OR LOWER(s.code) LIKE :term)', {
        term: `%${query.search.trim().toLowerCase()}%`,
      });
    }

    qb.orderBy('s.createdAt', 'DESC').skip(skip).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async get(id: string | number, companyId: number, write = false) {
    const item = await this.repo.findOne({ where: { id: Number(id) } });
    return ensureCompanyScope(item, companyId, 'Escenario no encontrado', write);
  }

  async create(dto: CreateScenaryDto, user: any, companyId: number) {
    const item = this.repo.create({
      ...dto,
      isActive: dto.isActive !== undefined ? dto.isActive : true,
      companyId,
      createdBy: user?.user_id?.toString() || user?.id?.toString(),
      createdName: user?.user_name || user?.name,
    });
    return this.repo.save(item);
  }

  async update(id: string | number, dto: UpdateScenaryDto, user: any, companyId: number) {
    const item = await this.get(id, companyId, true);
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
