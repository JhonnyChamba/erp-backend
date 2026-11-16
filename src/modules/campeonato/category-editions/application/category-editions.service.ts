import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoryEditionOrmEntity } from '../../infrastructure/persistence/category-edition.orm-entity';
import { CreateCategoryEditionDto, UpdateCategoryEditionDto } from './dto/category-edition.dto';

@Injectable()
export class CategoryEditionsService {
  constructor(
    @InjectRepository(CategoryEditionOrmEntity)
    private readonly repo: Repository<CategoryEditionOrmEntity>,
  ) {}

  async list(companyId: number, query: { page?: number; limit?: number; search?: string }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const qb = this.repo.createQueryBuilder('ce').leftJoinAndSelect('ce.category', 'category');
    if (companyId) {
      qb.andWhere('(ce.companyId = :companyId OR ce.companyId IS NULL)', { companyId });
    }
    if (query.search?.trim()) {
      qb.andWhere('(LOWER(ce.name) LIKE :term OR LOWER(category.name) LIKE :term)', {
        term: `%${query.search.trim().toLowerCase()}%`,
      });
    }

    qb.orderBy('ce.createdAt', 'DESC').skip(skip).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async get(id: string) {
    const item = await this.repo.findOne({ where: { id }, relations: ['category'] });
    if (!item) throw new NotFoundException('Edición de categoría no encontrada');
    return item;
  }

  async create(dto: CreateCategoryEditionDto, user: any, companyId: number) {
    const item = this.repo.create({
      ...dto,
      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      companyId,
      createdBy: user?.user_id?.toString() || user?.id?.toString(),
      createdName: user?.user_name || user?.name,
    });
    return this.repo.save(item);
  }

  async update(id: string, dto: UpdateCategoryEditionDto, user: any) {
    const item = await this.get(id);
    Object.assign(item, dto, {
      startDate: dto.startDate ? new Date(dto.startDate) : item.startDate,
      endDate: dto.endDate ? new Date(dto.endDate) : item.endDate,
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
