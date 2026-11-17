import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeamOrmEntity } from '../../infrastructure/persistence/team.orm-entity';
import { TeamCategoryHistoryOrmEntity } from '../../infrastructure/persistence/team-category-history.orm-entity';
import { CreateTeamDto, UpdateTeamDto } from './dto/team.dto';

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(TeamOrmEntity)
    private readonly repo: Repository<TeamOrmEntity>,
    @InjectRepository(TeamCategoryHistoryOrmEntity)
    private readonly historyRepo: Repository<TeamCategoryHistoryOrmEntity>,
  ) {}

  async list(companyId: number, query: { page?: number; limit?: number; search?: string }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const qb = this.repo
      .createQueryBuilder('t')
      .leftJoinAndSelect('t.currentCategory', 'currentCategory');

    if (companyId) {
      qb.andWhere('(t.companyId = :companyId OR t.companyId IS NULL)', { companyId });
    }
    if (query.search?.trim()) {
      qb.andWhere('(LOWER(t.name) LIKE :term OR LOWER(t.shortName) LIKE :term OR LOWER(t.acronyms) LIKE :term)', {
        term: `%${query.search.trim().toLowerCase()}%`,
      });
    }

    qb.orderBy('t.createdAt', 'DESC').skip(skip).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async get(id: string) {
    const item = await this.repo.findOne({
      where: { id },
      relations: ['currentCategory'],
    });
    if (!item) throw new NotFoundException('Equipo no encontrado');
    return item;
  }

  async create(dto: CreateTeamDto, user: any, companyId: number) {
    const item = this.repo.create({
      ...dto,
      dateOfFoundation: dto.dateOfFoundation ? new Date(dto.dateOfFoundation) : undefined,
      companyId,
      createdBy: user?.user_id?.toString() || user?.id?.toString(),
      createdName: user?.user_name || user?.name,
    });
    const saved = await this.repo.save(item);

    // Si se asignó una categoría inicial, registrar en el historial
    if (saved.currentCategoryId) {
      await this.historyRepo.save(
        this.historyRepo.create({
          companyId,
          teamId: saved.id,
          categoryId: saved.currentCategoryId,
          seasonYear: saved.currentSeasonYear || '2026',
          status: 'ACTUAL',
          assignedDate: new Date(),
          notes: 'Asignación inicial al registrar el equipo',
          createdBy: user?.user_id?.toString() || user?.id?.toString(),
          createdName: user?.user_name || user?.name,
        }),
      );
    }

    return saved;
  }

  async update(id: string, dto: UpdateTeamDto, user: any) {
    const item = await this.get(id);
    const prevCategoryId = item.currentCategoryId;

    Object.assign(item, dto, {
      dateOfFoundation: dto.dateOfFoundation ? new Date(dto.dateOfFoundation) : item.dateOfFoundation,
      updatedBy: user?.user_id?.toString() || user?.id?.toString(),
      updateName: user?.user_name || user?.name,
    });
    const saved = await this.repo.save(item);

    // Si cambió la categoría asignada o se asignó por primera vez, guardar en el historial
    if (dto.currentCategoryId && dto.currentCategoryId !== prevCategoryId) {
      await this.historyRepo.save(
        this.historyRepo.create({
          companyId: item.companyId,
          teamId: item.id,
          categoryId: dto.currentCategoryId,
          seasonYear: dto.currentSeasonYear || item.currentSeasonYear || '2026',
          status: 'ACTUAL',
          assignedDate: new Date(),
          notes: `Actualización de categoría para temporada ${dto.currentSeasonYear || item.currentSeasonYear || '2026'}`,
          createdBy: user?.user_id?.toString() || user?.id?.toString(),
          createdName: user?.user_name || user?.name,
        }),
      );
    }

    return saved;
  }

  async remove(id: string) {
    const item = await this.get(id);
    return this.repo.remove(item);
  }
}
