import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefereeGuildOrmEntity } from '../../infrastructure/persistence/referee-guild.orm-entity';
import { CreateRefereeGuildDto, UpdateRefereeGuildDto } from './dto/referee-guild.dto';

@Injectable()
export class RefereeGuildsService {
  constructor(
    @InjectRepository(RefereeGuildOrmEntity)
    private readonly repo: Repository<RefereeGuildOrmEntity>,
  ) {}

  async list(query: { page?: number; limit?: number; search?: string; status?: string; description?: string; acronyms?: string }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 50));
    const skip = (page - 1) * limit;

    const qb = this.repo.createQueryBuilder('rg');
    if (query.status === 'true' || query.status === 'false') {
      qb.andWhere('rg.isActive = :isActive', { isActive: query.status === 'true' });
    }
    if (query.description?.trim()) {
      qb.andWhere('LOWER(rg.description) LIKE :desc', { desc: `%${query.description.trim().toLowerCase()}%` });
    }
    if (query.acronyms?.trim()) {
      qb.andWhere('LOWER(rg.acronyms) LIKE :acro', { acro: `%${query.acronyms.trim().toLowerCase()}%` });
    }
    if (query.search?.trim()) {
      qb.andWhere('(LOWER(rg.description) LIKE :term OR LOWER(rg.acronyms) LIKE :term)', {
        term: `%${query.search.trim().toLowerCase()}%`,
      });
    }

    qb.orderBy('rg.description', 'ASC').skip(skip).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async get(id: string | number) {
    const item = await this.repo.findOne({ where: { id: Number(id) } });
    if (!item) throw new NotFoundException('Gremio arbitral no encontrado');
    return item;
  }

  async create(dto: CreateRefereeGuildDto, user: any) {
    const item = this.repo.create({
      description: dto.description.trim(),
      acronyms: dto.acronyms ? dto.acronyms.trim().toUpperCase() : undefined,
      isActive: dto.isActive !== undefined ? dto.isActive : true,
      createdBy: user?.user_id?.toString() || user?.id?.toString(),
      createdName: user?.user_name || user?.name,
    });
    return this.repo.save(item);
  }

  async update(id: string | number, dto: UpdateRefereeGuildDto, user: any) {
    const item = await this.get(id);
    if (dto.description !== undefined) item.description = dto.description.trim();
    if (dto.acronyms !== undefined) item.acronyms = dto.acronyms ? dto.acronyms.trim().toUpperCase() : '';
    if (dto.isActive !== undefined) item.isActive = dto.isActive;
    item.updatedBy = user?.user_id?.toString() || user?.id?.toString();
    item.updateName = user?.user_name || user?.name;
    return this.repo.save(item);
  }

  async remove(id: string | number) {
    const item = await this.get(id);
    return this.repo.remove(item);
  }
}
