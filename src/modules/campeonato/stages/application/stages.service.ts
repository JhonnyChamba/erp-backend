import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StageOrmEntity } from '../../infrastructure/persistence/stage.orm-entity';
import { CreateStageDto, UpdateStageDto } from './dto/stage.dto';

@Injectable()
export class StagesService {
  constructor(
    @InjectRepository(StageOrmEntity)
    private readonly repo: Repository<StageOrmEntity>,
  ) {}

  async list(companyId: number, query: { page?: number; limit?: number; search?: string }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const qb = this.repo.createQueryBuilder('s').leftJoinAndSelect('s.categoryEdition', 'categoryEdition');
    if (companyId) {
      qb.andWhere('(s.companyId = :companyId OR s.companyId IS NULL)', { companyId });
    }
    if (query.search?.trim()) {
      qb.andWhere('(LOWER(s.name) LIKE :term OR LOWER(categoryEdition.name) LIKE :term)', {
        term: `%${query.search.trim().toLowerCase()}%`,
      });
    }

    qb.orderBy('s.stageOrder', 'ASC').addOrderBy('s.createdAt', 'DESC').skip(skip).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async get(id: string) {
    const item = await this.repo.findOne({ where: { id }, relations: ['categoryEdition'] });
    if (!item) throw new NotFoundException('Etapa no encontrada');
    return item;
  }

  async create(dto: CreateStageDto, user: any, companyId: number) {
    const item = this.repo.create({
      ...dto,
      companyId,
      createdBy: user?.user_id?.toString() || user?.id?.toString(),
      createdName: user?.user_name || user?.name,
    });
    return this.repo.save(item);
  }

  async update(id: string, dto: UpdateStageDto, user: any) {
    const item = await this.get(id);
    Object.assign(item, dto, {
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
