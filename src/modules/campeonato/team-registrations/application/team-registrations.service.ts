import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { assertBelongsToCompany, ensureCompanyScope } from '../../common/company-scope.util';
import { TeamRegistrationOrmEntity } from '../../infrastructure/persistence/team-registration.orm-entity';
import { TeamOrmEntity } from '../../infrastructure/persistence/team.orm-entity';
import { CategoryEditionOrmEntity } from '../../infrastructure/persistence/category-edition.orm-entity';
import { CategoryOrmEntity } from '../../infrastructure/persistence/category.orm-entity';
import { TeamCategoryHistoryOrmEntity } from '../../infrastructure/persistence/team-category-history.orm-entity';
import {
  CreateTeamRegistrationDto,
  UpdateTeamRegistrationDto,
  SyncEditionTeamRegistrationsDto,
} from './dto/team-registration.dto';
import { RegistrationStatus, PaymentStatus } from '../../common/enum/campeonato.enum';
import { TeamPaymentOrdersService } from '../../team-payment-orders/application/team-payment-orders.service';

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
    private readonly paymentOrders: TeamPaymentOrdersService,
  ) {}

  private async syncTeamCategoryHistory(
    teamId: string | number,
    categoryEditionId: string | number,
    user: any,
    companyId: number,
    explicitCategoryId?: string | number | null,
  ) {
    try {
      const numTeamId = Number(teamId);
      const numEditionId = Number(categoryEditionId);
      const edition = await this.editionRepo.findOne({
        where: { id: numEditionId },
        relations: ['category', 'categoriesDetail', 'categoriesDetail.category'],
      });
      if (!edition) return;

      const resolvedCategoryId =
        (explicitCategoryId ? Number(explicitCategoryId) : null) ||
        edition.categoryId ||
        edition.categoriesDetail?.[0]?.categoryId ||
        null;
      if (!resolvedCategoryId) return;

      const categoryRepo = this.repo.manager.getRepository(CategoryOrmEntity);
      const catEntity = await categoryRepo.findOne({ where: { id: resolvedCategoryId } });

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
        currentCategoryId: resolvedCategoryId,
        currentSeasonYear: seasonYear,
      });

      // 2. Registrar en la tabla transaccional de historial de categorías
      const notes = `Inscripción oficial en torneo/edición: ${edition.name} (${catEntity?.name || edition.category?.name || 'Categoría'})`;
      const assignedDate = new Date();

      await this.historyRepo.save(
        this.historyRepo.create({
          companyId,
          teamId: numTeamId,
          categoryId: resolvedCategoryId,
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

  async list(companyId: number, query: { page?: number; limit?: number; search?: string; categoryEditionId?: number; categoryId?: number }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(200, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const qb = this.repo
      .createQueryBuilder('tr')
      .leftJoinAndSelect('tr.categoryEdition', 'categoryEdition')
      .leftJoinAndSelect('tr.category', 'category')
      .leftJoinAndSelect('tr.team', 'team');

    if (companyId) {
      qb.andWhere('(tr.companyId = :companyId OR tr.companyId IS NULL)', { companyId });
    }
    if (query.categoryEditionId) {
      qb.andWhere('tr.categoryEditionId = :edId', { edId: Number(query.categoryEditionId) });
    }
    if (query.categoryId) {
      qb.andWhere('tr.categoryId = :catId', { catId: Number(query.categoryId) });
    }
    if (query.search?.trim()) {
      qb.andWhere('(LOWER(team.name) LIKE :term OR LOWER(tr.groupName) LIKE :term OR LOWER(categoryEdition.name) LIKE :term OR LOWER(category.name) LIKE :term)', {
        term: `%${query.search.trim().toLowerCase()}%`,
      });
    }

    qb.orderBy('tr.createdAt', 'DESC').skip(skip).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  // Listado agrupado: una fila por edición del torneo, con sus categorías y los equipos inscritos (para los modales del listado).
  async listByEdition(companyId: number, query: { page?: number; limit?: number; search?: string; status?: string; paymentStatus?: string }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 10));

    const applyFilters = (qb: ReturnType<Repository<TeamRegistrationOrmEntity>['createQueryBuilder']>) => {
      if (companyId) qb.andWhere('(tr.companyId = :companyId OR tr.companyId IS NULL)', { companyId });
      if (query.status && query.status !== 'todos') qb.andWhere('tr.status = :status', { status: query.status });
      if (query.paymentStatus && query.paymentStatus !== 'todos') qb.andWhere('tr.paymentStatus = :paymentStatus', { paymentStatus: query.paymentStatus });
      if (query.search?.trim()) {
        qb.andWhere('(LOWER(team.name) LIKE :term OR LOWER(tr.groupName) LIKE :term OR LOWER(categoryEdition.name) LIKE :term OR LOWER(category.name) LIKE :term)', {
          term: `%${query.search.trim().toLowerCase()}%`,
        });
      }
      return qb;
    };
    const baseQb = () => this.repo.createQueryBuilder('tr').leftJoin('tr.categoryEdition', 'categoryEdition').leftJoin('tr.category', 'category').leftJoin('tr.team', 'team');

    const total = Number((await applyFilters(baseQb()).select('COUNT(DISTINCT tr.categoryEditionId)', 'n').getRawOne())?.n) || 0;
    const editionRows = await applyFilters(baseQb())
      .select('tr.categoryEditionId', 'editionId')
      .groupBy('tr.categoryEditionId')
      .orderBy('tr.categoryEditionId', 'DESC')
      .offset((page - 1) * limit)
      .limit(limit)
      .getRawMany();
    const editionIds = editionRows.map((r) => Number(r.editionId));
    if (editionIds.length === 0) return { data: [], total, page, limit, totalPages: Math.ceil(total / limit) };

    const registrations = await applyFilters(
      this.repo
        .createQueryBuilder('tr')
        .leftJoinAndSelect('tr.categoryEdition', 'categoryEdition')
        .leftJoinAndSelect('tr.category', 'category')
        .leftJoinAndSelect('tr.team', 'team')
        .andWhere('tr.categoryEditionId IN (:...editionIds)', { editionIds }),
    )
      .orderBy('team.name', 'ASC')
      .getMany();

    const editions = await this.editionRepo.find({ where: { id: In(editionIds) }, relations: ['category', 'categoriesDetail', 'categoriesDetail.category'] });
    const editionById = new Map(editions.map((e) => [Number(e.id), e]));

    const data = editionIds.map((editionId) => {
      const edition: any = editionById.get(editionId);
      const regs = registrations.filter((r) => Number(r.categoryEditionId) === editionId);

      // Todas las categorías de la edición (aunque aún no tengan equipos).
      const rawCats: any[] =
        Array.isArray(edition?.categoriesDetail) && edition.categoriesDetail.length > 0
          ? edition.categoriesDetail.map((det: any) => {
              const categoryId = Number(det.categoryId || det.category?.id);
              return {
                categoryId,
                name: det.categoryDescription || det.category?.name || '',
                acronyms: det.category?.acronyms || '',
                gender: det.category?.gender || '',
                startDate: det.startDate ?? null,
                endDate: det.endDate ?? null,
                registrationFee: Number(det.registrationFee) || 0,
                maxPlayers: Number(det.maxPlayers) || null,
              };
            })
          : edition?.category
            ? [{ categoryId: Number(edition.category.id), name: edition.category.name, acronyms: edition.category.acronyms || '', gender: edition.category.gender || '', startDate: edition.startDate ?? null, endDate: edition.endDate ?? null, registrationFee: Number(edition.registrationFee) || 0, maxPlayers: Number(edition.maxPlayersPerTeam) || null }]
            : [];

      const firstCatId = rawCats[0]?.categoryId ? Number(rawCats[0].categoryId) : null;
      const firstCatName = rawCats[0]?.name || '';

      const categories = rawCats.map((cat, idx) => {
        const count = regs.filter((r) => {
          if (r.categoryId) return Number(r.categoryId) === Number(cat.categoryId);
          return idx === 0;
        }).length;
        return {
          ...cat,
          teamsCount: count,
        };
      });

      return {
        id: editionId,
        categoryEditionId: editionId,
        categoryEdition: { id: editionId, name: edition?.name ?? regs[0]?.categoryEdition?.name ?? '' },
        categoriesCount: categories.length,
        teamsCount: regs.length,
        categories,
        teams: regs.map((r) => {
          const effCatId = r.categoryId ?? firstCatId;
          const effCatName =
            r.category?.name ??
            categories.find((c) => Number(c.categoryId) === Number(effCatId))?.name ??
            firstCatName;
          return {
            id: r.id,
            teamId: r.teamId,
            name: r.team?.name ?? '',
            shortName: r.team?.shortName ?? '',
            acronyms: r.team?.acronyms ?? '',
            logo: r.team?.logo ?? '',
            categoryId: effCatId,
            categoryName: effCatName,
            groupName: r.groupName ?? '',
            status: r.status,
            paymentStatus: r.paymentStatus,
            pointsPenalty: r.pointsPenalty,
          };
        }),
      };
    });

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async get(id: string | number, companyId: number, write = false) {
    const item = await this.repo.findOne({
      where: { id: Number(id) },
      relations: ['categoryEdition', 'category', 'team'],
    });
    return ensureCompanyScope(item, companyId, 'Inscripción de equipo no encontrada', write);
  }

  async create(dto: CreateTeamRegistrationDto, user: any, companyId: number) {
    await assertBelongsToCompany(this.teamRepo, dto.teamId, companyId, 'Equipo no encontrado');
    await assertBelongsToCompany(this.editionRepo, dto.categoryEditionId, companyId, 'Edición de torneo no encontrada');
    const item = this.repo.create({
      ...dto,
      // Toda inscripción nueva queda pendiente de aprobación y de pago
      status: dto.status ?? RegistrationStatus.PENDING,
      paymentStatus: dto.paymentStatus ?? PaymentStatus.UNPAID,
      companyId,
      createdBy: user?.user_id?.toString() || user?.id?.toString(),
      createdName: user?.user_name || user?.name,
    });
    const saved = await this.repo.save(item);

    if (dto.teamId && dto.categoryEditionId) {
      await this.syncTeamCategoryHistory(dto.teamId, dto.categoryEditionId, user, companyId, dto.categoryId);
    }

    const paymentOrders = await this.paymentOrders.generateForRegistrations([saved], user, companyId);

    return { ...(await this.get(saved.id, companyId)), paymentOrders };
  }

  async syncByEdition(dto: SyncEditionTeamRegistrationsDto, user: any, companyId: number) {
    const editionId = Number(dto.categoryEditionId);
    await assertBelongsToCompany(this.editionRepo, editionId, companyId, 'Edición de torneo no encontrada');

    // Validar que un mismo equipo no esté repetido dentro de la MISMA categoría
    // (Sí puede participar en múltiples categorías de la misma edición, ej. Máxima Varones y Primera Mujeres)
    const seenCategoryTeams = new Set<string>();
    const incomingItems: Array<{
      id?: number;
      categoryId: number;
      teamId: number;
      groupName?: string;
      status?: RegistrationStatus;
      paymentStatus?: PaymentStatus;
      pointsPenalty: number;
    }> = [];

    for (const catGroup of dto.categories || []) {
      const catId = Number(catGroup.categoryId);
      const seenInThisCat = new Set<number>();
      for (const tm of catGroup.teams || []) {
        const tId = Number(tm.teamId);
        if (!tId) continue;
        if (seenInThisCat.has(tId)) {
          throw new BadRequestException('Un mismo equipo no puede estar inscrito dos veces en la misma categoría.');
        }
        seenInThisCat.add(tId);
        const key = `${catId}_${tId}`;
        seenCategoryTeams.add(key);
        await assertBelongsToCompany(this.teamRepo, tId, companyId, 'Equipo no encontrado');
        incomingItems.push({
          id: tm.id ? Number(tm.id) : undefined,
          categoryId: catId,
          teamId: tId,
          groupName: tm.groupName?.trim() || undefined,
          // Sin estado enviado: una inscripción nueva queda pendiente y una existente conserva el suyo
          status: tm.status,
          paymentStatus: tm.paymentStatus,
          pointsPenalty: Number(tm.pointsPenalty) || 0,
        });
      }
    }

    // Obtener inscripciones actuales de esta edición para esta empresa
    const existing = await this.repo.find({
      where: { categoryEditionId: editionId, companyId },
    });

    const existingById = new Map<number, TeamRegistrationOrmEntity>();
    const existingByCatAndTeam = new Map<string, TeamRegistrationOrmEntity>();
    for (const ex of existing) {
      existingById.set(Number(ex.id), ex);
      if (ex.categoryId) {
        existingByCatAndTeam.set(`${Number(ex.categoryId)}_${Number(ex.teamId)}`, ex);
      }
    }

    const keptIds = new Set<number>();
    const savedResults: TeamRegistrationOrmEntity[] = [];
    const createdRegistrations: TeamRegistrationOrmEntity[] = [];
    const userId = user?.user_id?.toString() || user?.id?.toString();
    const userName = user?.user_name || user?.name;

    for (const inc of incomingItems) {
      const compositeKey = `${inc.categoryId}_${inc.teamId}`;
      let prev =
        (inc.id ? existingById.get(Number(inc.id)) : undefined) ||
        existingByCatAndTeam.get(compositeKey) ||
        existing.find((ex) => !ex.categoryId && Number(ex.teamId) === inc.teamId && !keptIds.has(Number(ex.id)));

      if (prev && keptIds.has(Number(prev.id))) {
        prev = undefined;
      }

      if (prev) {
        keptIds.add(Number(prev.id));
        const categoryChanged = Number(prev.categoryId) !== Number(inc.categoryId);
        prev.categoryId = inc.categoryId;
        prev.groupName = inc.groupName ?? null;
        if (inc.status) prev.status = inc.status;
        if (inc.paymentStatus) prev.paymentStatus = inc.paymentStatus;
        prev.pointsPenalty = inc.pointsPenalty;
        prev.updatedBy = userId;
        prev.updateName = userName;
        const updated = await this.repo.save(prev);
        savedResults.push(updated);
        if (categoryChanged) {
          await this.syncTeamCategoryHistory(inc.teamId, editionId, user, companyId, inc.categoryId);
        }
      } else {
        const created = await this.repo.save(
          this.repo.create({
            companyId,
            categoryEditionId: editionId,
            categoryId: inc.categoryId,
            teamId: inc.teamId,
            groupName: inc.groupName,
            status: inc.status ?? RegistrationStatus.PENDING,
            paymentStatus: inc.paymentStatus ?? PaymentStatus.UNPAID,
            pointsPenalty: inc.pointsPenalty,
            createdBy: userId,
            createdName: userName,
          }),
        );
        keptIds.add(Number(created.id));
        savedResults.push(created);
        createdRegistrations.push(created);
        await this.syncTeamCategoryHistory(inc.teamId, editionId, user, companyId, inc.categoryId);
      }
    }

    // Eliminar inscripciones que fueron quitadas de la edición
    const toRemove = existing.filter((ex) => !keptIds.has(Number(ex.id)));
    if (toRemove.length > 0) {
      await this.repo.remove(toRemove);
    }

    // Cada equipo inscrito genera su orden de pago: una línea por categoría y, en cada una, los conceptos que se cobran
    const paymentOrders = await this.paymentOrders.generateForRegistrations(createdRegistrations, user, companyId);

    return {
      categoryEditionId: editionId,
      totalRegistered: savedResults.length,
      data: savedResults,
      paymentOrders,
    };
  }

  async update(id: string | number, dto: UpdateTeamRegistrationDto, user: any, companyId: number) {
    const item = await this.get(id, companyId, true);
    if (dto.teamId) {
      await assertBelongsToCompany(this.teamRepo, dto.teamId, companyId, 'Equipo no encontrado');
    }
    if (dto.categoryEditionId) {
      await assertBelongsToCompany(this.editionRepo, dto.categoryEditionId, companyId, 'Edición de torneo no encontrada');
    }
    Object.assign(item, dto, {
      updatedBy: user?.user_id?.toString() || user?.id?.toString(),
      updateName: user?.user_name || user?.name,
    });
    const saved = await this.repo.save(item);

    const targetTeamId = dto.teamId || item.teamId;
    const targetEditionId = dto.categoryEditionId || item.categoryEditionId;
    const targetCategoryId = dto.categoryId || item.categoryId;
    if (targetTeamId && targetEditionId) {
      await this.syncTeamCategoryHistory(targetTeamId, targetEditionId, user, item.companyId, targetCategoryId);
    }

    return this.get(saved.id, companyId);
  }

  async remove(id: string | number, companyId: number) {
    const item = await this.get(id, companyId, true);
    return this.repo.remove(item);
  }
}
