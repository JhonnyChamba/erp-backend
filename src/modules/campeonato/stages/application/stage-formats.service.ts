import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StageFormatOrmEntity } from '../../infrastructure/persistence/stage-format.orm-entity';
import { CreateStageFormatDto, UpdateStageFormatDto } from './dto/stage-format.dto';

@Injectable()
export class StageFormatsService {
  constructor(
    @InjectRepository(StageFormatOrmEntity)
    private readonly repo: Repository<StageFormatOrmEntity>,
  ) {}

  async list(companyId: number, query: { page?: number; limit?: number; search?: string }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const qb = this.repo.createQueryBuilder('f');
    if (query.search?.trim()) {
      qb.andWhere('(LOWER(f.name) LIKE :term OR LOWER(COALESCE(f.code, \'\')) LIKE :term OR LOWER(COALESCE(f.description, \'\')) LIKE :term)', {
        term: `%${query.search.trim().toLowerCase()}%`,
      });
    }

    qb.orderBy('f.createdAt', 'ASC').skip(skip).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async get(id: string | number) {
    const item = await this.repo.findOne({ where: { id: Number(id) } });
    if (!item) throw new NotFoundException('Formato de disputa no encontrado');
    return item;
  }

  async create(dto: CreateStageFormatDto, user: any, companyId: number) {
    let code = dto.code?.trim();
    if (!code) {
      const count = await this.repo.count();
      code = `FMT-${String(count + 1).padStart(3, '0')}`;
    }

    const item = this.repo.create({
      ...dto,
      code,
      companyId: null, // Catálogo global
      isActive: dto.isActive !== undefined ? dto.isActive : true,
      createdBy: user?.user_id?.toString() || user?.id?.toString(),
      createdName: user?.user_name || user?.name,
    });
    return this.repo.save(item);
  }

  async update(id: string | number, dto: UpdateStageFormatDto, user: any) {
    const item = await this.get(id);
    Object.assign(item, dto, {
      updatedBy: user?.user_id?.toString() || user?.id?.toString(),
      updateName: user?.user_name || user?.name,
    });
    return this.repo.save(item);
  }

  async remove(id: string | number) {
    const item = await this.get(id);
    await this.repo.remove(item);
    return { message: 'Formato de disputa eliminado exitosamente' };
  }
}
