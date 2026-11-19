import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { assertBelongsToCompany, ensureCompanyScope } from '../../common/company-scope.util';
import { TeamRegistrationOrmEntity } from '../../infrastructure/persistence/team-registration.orm-entity';
import { TeamOrmEntity } from '../../infrastructure/persistence/team.orm-entity';
import { CategoryEditionOrmEntity } from '../../infrastructure/persistence/category-edition.orm-entity';
import { TeamCategoryHistoryOrmEntity } from '../../infrastructure/persistence/team-category-history.orm-entity';
import { CreateTeamRegistrationDto, UpdateTeamRegistrationDto } from './dto/team-registration.dto';

@Injectable()
export class TeamRegistrationsService {
  constructor(
    @InjectRepository(TeamRegistrationOrmEntity)
    private readonly repo: Repository<TeamRegistrationOrmEntity>,
    @InjectRepository(TeamOrmEntity)
    private readonly teamRepo: Repository<TeamOrmEntity>,
    @InjectRepository(CategoryEditionOrmEntity)
    private readonly editionRepo: Repository<CategoryEditionOrmEntity>,
    @InjectRepository(TeamCategoryHistoryOrmEntity)
    private readonly historyRepo: Repository<TeamCategoryHistoryOrmEntity>,
  ) {}

  private async syncTeamCategoryHistory(teamId: string | number, categoryEditionId: string | number, user: any, companyId: number) {
    try {
      const numTeamId = Number(teamId);
      const numEditionId = Number(categoryEditionId);
      const edition = await this.editionRepo.findOne({
        where: { id: numEditionId },
        relations: ['category'],
      });
      if (!edition || !edition.categoryId) return;

      // Extraer año de la temporada
      let seasonYear = new Date().getFullYear().toString();
      if (edition.startDate) {
        seasonYear = new Date(edition.startDate).getFullYear().toString();
      } else {
        const yearMatch = (edition.name || '').match(/\b20\d\d\b/);
        if (yearMatch) seasonYear = yearMatch[0];
      }

      // 1. Actualizar categoría y temporada actual del equipo
      await this.teamRepo.update(numTeamId, {
        currentCategoryId: edition.categoryId,
        currentSeasonYear: seasonYear,
      });

      // 2. Registrar en la tabla transaccional de historial de categorías
      const notes = `Inscripción oficial en torneo/edición: ${edition.name} (${edition.category?.name || 'Categoría'})`;
      const assignedDate = new Date();

      await this.historyRepo.save(
        this.historyRepo.create({
          companyId,
          teamId: numTeamId,
          categoryId: edition.categoryId,
          seasonYear,
          status: 'ACTIVE',
          assignedDate,
          notes,
          createdBy: user?.user_id?.toString() || user?.id?.toString(),
          createdName: user?.user_name || user?.name,
        }),
      );
    } catch (err) {
      console.error('Error al sincronizar historial de categoría desde inscripción de equipo:', err);
    }
  }

  async list(companyId: number, query: { page?: number; limit?: number; search?: string }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const qb = this.repo
      .createQueryBuilder('tr')
      .leftJoinAndSelect('tr.categoryEdition', 'categoryEdition')
      .leftJoinAndSelect('tr.team', 'team');

    if (companyId) {
      qb.andWhere('(tr.companyId = :companyId OR tr.companyId IS NULL)', { companyId });
    }
    if (query.search?.trim()) {
      qb.andWhere('(LOWER(team.name) LIKE :term OR LOWER(tr.groupName) LIKE :term)', {
        term: `%${query.search.trim().toLowerCase()}%`,
      });
    }

    qb.orderBy('tr.createdAt', 'DESC').skip(skip).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async get(id: string | number, companyId: number, write = false) {
    const item = await this.repo.findOne({ where: { id: Number(id) }, relations: ['categoryEdition', 'team'] });
    return ensureCompanyScope(item, companyId, 'Inscripción de equipo no encontrada', write);
  }

  async create(dto: CreateTeamRegistrationDto, user: any, companyId: number) {
    await assertBelongsToCompany(this.teamRepo, dto.teamId, companyId, 'Equipo no encontrado');
    await assertBelongsToCompany(this.editionRepo, dto.categoryEditionId, companyId, 'Edición de torneo no encontrada');
    const item = this.repo.create({
      ...dto,
      companyId,
      createdBy: user?.user_id?.toString() || user?.id?.toString(),
      createdName: user?.user_name || user?.name,
    });
    const saved = await this.repo.save(item);

    if (dto.teamId && dto.categoryEditionId) {
      await this.syncTeamCategoryHistory(dto.teamId, dto.categoryEditionId, user, companyId);
    }

    return saved;
  }

  async update(id: string | number, dto: UpdateTeamRegistrationDto, user: any, companyId: number) {
    const item = await this.get(id, companyId, true);
    await assertBelongsToCompany(this.teamRepo, dto.teamId, companyId, 'Equipo no encontrado');
    await assertBelongsToCompany(this.editionRepo, dto.categoryEditionId, companyId, 'Edición de torneo no encontrada');
    Object.assign(item, dto, {
      updatedBy: user?.user_id?.toString() || user?.id?.toString(),
      updateName: user?.user_name || user?.name,
    });
    const saved = await this.repo.save(item);

    const targetTeamId = dto.teamId || item.teamId;
    const targetEditionId = dto.categoryEditionId || item.categoryEditionId;
    if (targetTeamId && targetEditionId) {
      await this.syncTeamCategoryHistory(targetTeamId, targetEditionId, user, item.companyId);
    }

    return saved;
  }

  async remove(id: string | number, companyId: number) {
    const item = await this.get(id, companyId, true);
    return this.repo.remove(item);
  }
}
