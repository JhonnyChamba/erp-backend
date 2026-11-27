import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DivisionGroupRepository } from '../../domain/repositories/division-group.repository';
import { DivisionGroup } from '../../domain/entities/division-group.entity';
import { DivisionGroupOrmEntity } from '../persistence/division-group.orm-entity';

@Injectable()
export class DivisionGroupRepositoryImpl implements DivisionGroupRepository {
  constructor(
    @InjectRepository(DivisionGroupOrmEntity)
    private readonly repo: Repository<DivisionGroupOrmEntity>,
  ) {}

  private toDomain(orm: DivisionGroupOrmEntity): DivisionGroup {
    return new DivisionGroup(
      orm.id,
      orm.companyId,
      orm.code,
      orm.description,
      orm.enabled,
      orm.deleted,
      orm.createdBy,
      orm.createdName,
      orm.createdAt,
      orm.updatedBy,
      orm.updateName,
      orm.updatedAt,
    );
  }

  async generateNextCode(companyId: number): Promise<string> {
    // Se revisan todos los registros de la empresa (incluidos eliminados) para no colisionar con la restricción única.
    const rows = await this.repo
      .createQueryBuilder('dg')
      .select('dg.code', 'code')
      .where('dg.companyId = :companyId', { companyId })
      .andWhere("dg.code LIKE 'GDIV-%'")
      .getRawMany<{ code: string }>();

    let maxNum = 0;
    for (const row of rows) {
      const match = row.code?.match(/^GDIV-(\d+)$/i);
      if (match) {
        const parsed = parseInt(match[1], 10);
        if (parsed > maxNum) maxNum = parsed;
      }
    }

    const nextNum = maxNum + 1;
    return `GDIV-${String(nextNum).padStart(3, '0')}`;
  }

  async create(entity: DivisionGroup): Promise<DivisionGroup> {
    const orm = this.repo.create({
      companyId: entity.companyId,
      code: entity.code,
      description: entity.description,
      enabled: entity.enabled ?? true,
      deleted: false,
      createdBy: entity.createdBy ?? undefined,
      createdName: entity.createdName ?? undefined,
    });
    const saved = await this.repo.save(orm);
    return this.toDomain(saved);
  }

  async findById(id: number, companyId: number): Promise<DivisionGroup | null> {
    const found = await this.repo.findOne({
      where: { id, companyId, deleted: false },
    });
    return found ? this.toDomain(found) : null;
  }

  async findByCompany(
    companyId: number,
    page = 1,
    limit = 50,
    search?: string,
  ): Promise<{ data: DivisionGroup[]; total: number }> {
    const qb = this.repo
      .createQueryBuilder('dg')
      .where('dg.companyId = :companyId', { companyId })
      .andWhere('dg.deleted = false');

    if (search?.trim()) {
      const term = `%${search.trim().toLowerCase()}%`;
      qb.andWhere('(LOWER(dg.description) LIKE :term OR LOWER(dg.code) LIKE :term)', { term });
    }

    qb.orderBy('dg.code', 'ASC')
      .addOrderBy('dg.id', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await qb.getManyAndCount();
    return {
      data: items.map((item) => this.toDomain(item)),
      total,
    };
  }

  async update(entity: DivisionGroup): Promise<DivisionGroup> {
    const existing = await this.repo.findOne({
      where: { id: entity.id!, companyId: entity.companyId, deleted: false },
    });
    if (!existing) {
      throw new NotFoundException('Grupo de división no encontrado');
    }

    existing.description = entity.description;
    existing.enabled = entity.enabled;
    existing.updatedBy = entity.updatedBy ?? existing.updatedBy;
    existing.updateName = entity.updateName ?? existing.updateName;

    const saved = await this.repo.save(existing);
    return this.toDomain(saved);
  }

  async softDelete(id: number, companyId: number, user?: any): Promise<void> {
    const existing = await this.repo.findOne({
      where: { id, companyId, deleted: false },
    });
    if (!existing) {
      throw new NotFoundException('Grupo de división no encontrado');
    }

    existing.deleted = true;
    existing.enabled = false;
    existing.updatedBy = user?.user_id?.toString() || user?.id?.toString() || existing.updatedBy;
    existing.updateName = user?.user_name || user?.name || existing.updateName;

    await this.repo.save(existing);
  }
}
