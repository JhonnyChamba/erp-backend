import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DemarcationOrmEntity } from '../../infrastructure/persistence/demarcation.orm-entity';
import { CreateDemarcationDto, UpdateDemarcationDto } from './dto/demarcation.dto';

@Injectable()
export class DemarcationsService {
  constructor(
    @InjectRepository(DemarcationOrmEntity)
    private readonly repo: Repository<DemarcationOrmEntity>,
  ) {}

  async list(companyId: number, query: { page?: number; limit?: number; search?: string; zone?: string; name?: string; code?: string }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 50));
    const skip = (page - 1) * limit;

    const qb = this.repo.createQueryBuilder('d');
    if (query.zone?.trim()) {
      qb.andWhere('d.zone = :zone', { zone: query.zone.trim() });
    }
    if (query.name?.trim()) {
      qb.andWhere('LOWER(d.name) LIKE :name', { name: `%${query.name.trim().toLowerCase()}%` });
    }
    if (query.code?.trim()) {
      qb.andWhere('LOWER(d.code) LIKE :code', { code: `%${query.code.trim().toLowerCase()}%` });
    }
    if (query.search?.trim()) {
      qb.andWhere('(LOWER(d.name) LIKE :term OR LOWER(d.code) LIKE :term)', {
        term: `%${query.search.trim().toLowerCase()}%`,
      });
    }

    qb.orderBy('d.name', 'ASC').skip(skip).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async get(id: string | number) {
    const item = await this.repo.findOne({ where: { id: Number(id) } });
    if (!item) throw new NotFoundException('Demarcación no encontrada');
    return item;
  }

  async create(dto: CreateDemarcationDto, user: any, companyId?: number) {
    const item = this.repo.create({
      ...dto,
      companyId: undefined, // Catálogo global
      createdBy: user?.user_id?.toString() || user?.id?.toString(),
      createdName: user?.user_name || user?.name,
    });
    return this.repo.save(item);
  }

  async update(id: string | number, dto: UpdateDemarcationDto, user: any) {
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
