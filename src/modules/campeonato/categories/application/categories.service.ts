import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoryOrmEntity } from '../../infrastructure/persistence/category.orm-entity';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(CategoryOrmEntity)
    private readonly repo: Repository<CategoryOrmEntity>,
  ) {}

  async list(companyId: number, query: { page?: number; limit?: number; search?: string }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const qb = this.repo.createQueryBuilder('c');
    if (companyId) {
      qb.andWhere('(c.companyId = :companyId OR c.companyId IS NULL)', { companyId });
    }
    if (query.search?.trim()) {
      qb.andWhere('(LOWER(c.name) LIKE :term OR LOWER(c.code) LIKE :term OR LOWER(COALESCE(c.acronyms, \'\')) LIKE :term)', {
        term: `%${query.search.trim().toLowerCase()}%`,
      });
    }

    qb.orderBy('c.createdAt', 'DESC').skip(skip).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async get(id: string | number) {
    const item = await this.repo.findOne({ where: { id: Number(id) } });
    if (!item) throw new NotFoundException('Categoría no encontrada');
    return item;
  }

  async create(dto: CreateCategoryDto, user: any, companyId: number) {
    let code = dto.code?.trim();
    if (!code || code === 'AUTO') {
      const qb = this.repo
        .createQueryBuilder('c')
        .where('c.companyId = :companyId', { companyId })
        .andWhere("c.code LIKE 'CAT-%'")
        .orderBy('c.createdAt', 'DESC');
      const latest = await qb.getOne();
      let nextNum = 1;
      if (latest && latest.code) {
        const match = latest.code.match(/CAT-(\d+)/i);
        if (match) {
          nextNum = parseInt(match[1], 10) + 1;
        } else {
          const totalCount = await this.repo.count({ where: { companyId } });
          nextNum = totalCount + 1;
        }
      } else {
        const totalCount = await this.repo.count({ where: { companyId } });
        nextNum = totalCount + 1;
      }
      code = `CAT-${String(nextNum).padStart(3, '0')}`;
    }

    const item = this.repo.create({
      ...dto,
      code,
      companyId,
      createdBy: user?.user_id?.toString() || user?.id?.toString(),
      createdName: user?.user_name || user?.name,
    });
    return this.repo.save(item);
  }

  async update(id: string | number, dto: UpdateCategoryDto, user: any) {
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
