import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';
import { assertBelongsToCompany, ensureCompanyScope } from '../../common/company-scope.util';
import { TeamRegistrationOrmEntity } from '../../infrastructure/persistence/team-registration.orm-entity';
import { TeamOrmEntity } from '../../infrastructure/persistence/team.orm-entity';
import { CategoryEditionOrmEntity } from '../../infrastructure/persistence/category-edition.orm-entity';
import { CategoryOrmEntity } from '../../infrastructure/persistence/category.orm-entity';
import { TeamCategoryHistoryOrmEntity } from '../../infrastructure/persistence/team-category-history.orm-entity';
import { PlayerRegistrationOrmEntity } from '../../infrastructure/persistence/player-registration.orm-entity';
import { TeamPaymentOrderOrmEntity } from '../../infrastructure/persistence/team-payment-order.orm-entity';
import { TeamPaymentOrderDetailOrmEntity } from '../../infrastructure/persistence/team-payment-order-detail.orm-entity';
import {
  CreateTeamRegistrationDto,
  UpdateTeamRegistrationDto,
  SyncEditionTeamRegistrationsDto,
} from './dto/team-registration.dto';
import { RegistrationStatus, PaymentStatus, PaymentOrderStatus } from '../../common/enum/campeonato.enum';
import { TeamPaymentOrdersService } from '../../team-payment-orders/application/team-payment-orders.service';

const UNIQUE_VIOLATION = '23505';

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

  /**
   * Las categorías de una inscripción deben estar configuradas en la edición (su detalle de categorías o, en ediciones antiguas,
   * su categoría única): de ahí salen la inscripción y la garantía que se cobran. Sin esto la orden de pago saldría en 0 sin avisar.
   */
  private async assertCategoriesInEdition(editionId: number, categoryIds: Array<number | null | undefined>) {
    const edition = await this.editionRepo.findOne({ where: { id: editionId }, relations: ['categoriesDetail'] });
    if (!edition) throw new BadRequestException('Edición de torneo no encontrada');

    const allowed = new Set<number>(edition.categoriesDetail?.length ? edition.categoriesDetail.map((det) => Number(det.categoryId)) : edition.categoryId ? [Number(edition.categoryId)] : []);
    if (allowed.size === 0) return;

    const names = new Map<number, string>();
    for (const det of edition.categoriesDetail ?? []) names.set(Number(det.categoryId), det.categoryDescription || `categoría ${det.categoryId}`);

    for (const categoryId of categoryIds) {
      if (!categoryId) throw new BadRequestException(`La edición "${edition.name}" tiene categorías configuradas: la inscripción debe indicar la categoría.`);
      if (!allowed.has(Number(categoryId))) {
        throw new BadRequestException(`La categoría ${categoryId} no está configurada en la edición "${edition.name}". Agrégala en el detalle de categorías de la edición antes de inscribir equipos.`);
      }
    }
  }

  /**
   * Prepara el borrado de inscripciones de equipos dentro de la transacción de quien llama:
   * - con una orden de pago ya pagada no se puede quitar la inscripción;
   * - los jugadores inscritos se borran en cascada: solo se permite con la confirmación del usuario (`forcePlayers`);
   * - las órdenes pendientes pierden la línea de la inscripción (se recalcula su total) y quedan canceladas si se quedan sin líneas.
   */
  private async releaseRegistrations(manager: EntityManager, registrations: TeamRegistrationOrmEntity[], forcePlayers: boolean) {
    if (registrations.length === 0) return;
    const ids = registrations.map((registration) => Number(registration.id));

    const lines = await manager.getRepository(TeamPaymentOrderDetailOrmEntity).find({ where: { teamRegistrationId: In(ids) }, relations: ['order'] });

    const paidOrders = [...new Set(lines.filter((line) => line.order?.status === PaymentOrderStatus.PAID).map((line) => line.order.id))];
    if (paidOrders.length > 0) {
      throw new BadRequestException(`No se pueden quitar inscripciones que tienen una orden de pago ya pagada (${paidOrders.length} orden(es)). Resuelve el pago antes de quitarlas.`);
    }

    const players = await manager.getRepository(PlayerRegistrationOrmEntity).count({ where: { teamRegistrationId: In(ids) } });
    if (players > 0 && !forcePlayers) {
      throw new ConflictException({ code: 'PLAYERS_WOULD_BE_DELETED', message: `Las inscripciones que se van a quitar tienen ${players} jugador(es) inscrito(s); al quitarlas también se eliminan. Confirma para continuar.`, players });
    }

    const orderRepo = manager.getRepository(TeamPaymentOrderOrmEntity);
    const detailRepo = manager.getRepository(TeamPaymentOrderDetailOrmEntity);
    const pendingOrderIds = [...new Set(lines.filter((line) => line.order?.status === PaymentOrderStatus.PENDING).map((line) => line.order.id))];

    for (const orderId of pendingOrderIds) {
      const removedLines = lines.filter((line) => line.order.id === orderId);
      await detailRepo.remove(removedLines);

      const remaining = await detailRepo.find({ where: { orderId } });
      const order = await orderRepo.findOneOrFail({ where: { id: orderId } });
      if (remaining.length === 0) {
        order.status = PaymentOrderStatus.CANCELLED;
      } else {
        order.totalAmount = Math.round(remaining.reduce((total, line) => total + Number(line.subtotal || 0), 0) * 100) / 100;
      }
      await orderRepo.save(order);
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
    await this.assertCategoriesInEdition(Number(dto.categoryEditionId), [dto.categoryId]);

    // La inscripción y su orden de pago se guardan juntas: si falla una, no queda la otra.
    let result: Awaited<ReturnType<TeamPaymentOrdersService['generateForRegistrations']>> & { saved: TeamRegistrationOrmEntity };
    try {
      result = await this.repo.manager.transaction(async (manager) => {
        const repo = manager.getRepository(TeamRegistrationOrmEntity);
        const saved = await repo.save(
          repo.create({
            ...dto,
            // Toda inscripción nueva queda pendiente de aprobación y de pago
            status: dto.status ?? RegistrationStatus.PENDING,
            paymentStatus: dto.paymentStatus ?? PaymentStatus.UNPAID,
            companyId,
            createdBy: user?.user_id?.toString() || user?.id?.toString(),
            createdName: user?.user_name || user?.name,
          }),
        );
        return { saved, ...(await this.paymentOrders.generateForRegistrations([saved], user, companyId, manager)) };
      });
    } catch (error) {
      if (error?.code === UNIQUE_VIOLATION) throw new BadRequestException('El equipo ya está inscrito en esa categoría de la edición.');
      throw error;
    }

    if (dto.teamId && dto.categoryEditionId) {
      await this.syncTeamCategoryHistory(dto.teamId, dto.categoryEditionId, user, companyId, dto.categoryId);
    }

    return { ...(await this.get(result.saved.id, companyId)), paymentOrders: result.orders, paymentOrdersSkipped: result.skipped };
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

    await this.assertCategoriesInEdition(editionId, [...new Set(incomingItems.map((item) => item.categoryId))]);

    const userId = user?.user_id?.toString() || user?.id?.toString();
    const userName = user?.user_name || user?.name;

    // Altas, cambios, bajas y órdenes de pago en una sola transacción: o se guarda todo o no se guarda nada.
    let outcome: { savedResults: TeamRegistrationOrmEntity[]; orders: TeamPaymentOrderOrmEntity[]; skipped: Awaited<ReturnType<TeamPaymentOrdersService['generateForRegistrations']>>['skipped']; historyJobs: Array<{ teamId: number; categoryId: number }> };
    try {
      outcome = await this.repo.manager.transaction(async (manager) => {
        const repo = manager.getRepository(TeamRegistrationOrmEntity);

        // Obtener inscripciones actuales de esta edición para esta empresa
        const existing = await repo.find({ where: { categoryEditionId: editionId, companyId } });

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
        // El historial de categorías se registra después de confirmar la transacción (si falla no debe deshacer la inscripción)
        const historyJobs: Array<{ teamId: number; categoryId: number }> = [];

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
            const updated = await repo.save(prev);
            savedResults.push(updated);
            if (categoryChanged) historyJobs.push({ teamId: inc.teamId, categoryId: inc.categoryId });
          } else {
            const created = await repo.save(
              repo.create({
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
            historyJobs.push({ teamId: inc.teamId, categoryId: inc.categoryId });
          }
        }

        // Eliminar inscripciones que fueron quitadas de la edición (con sus órdenes pendientes y, si el usuario lo confirma, sus jugadores)
        const toRemove = existing.filter((ex) => !keptIds.has(Number(ex.id)));
        if (toRemove.length > 0) {
          await this.releaseRegistrations(manager, toRemove, dto.forceRemovePlayers === true);
          await repo.remove(toRemove);
        }

        // Cada equipo inscrito genera su orden de pago: una línea por categoría y, en cada una, los conceptos que se cobran
        const { orders, skipped } = await this.paymentOrders.generateForRegistrations(createdRegistrations, user, companyId, manager);

        return { savedResults, orders, skipped, historyJobs };
      });
    } catch (error) {
      if (error?.code === UNIQUE_VIOLATION) throw new BadRequestException('Un equipo ya está inscrito en esa categoría de la edición.');
      throw error;
    }

    for (const job of outcome.historyJobs) {
      await this.syncTeamCategoryHistory(job.teamId, editionId, user, companyId, job.categoryId);
    }

    return {
      categoryEditionId: editionId,
      totalRegistered: outcome.savedResults.length,
      data: outcome.savedResults,
      paymentOrders: outcome.orders,
      paymentOrdersSkipped: outcome.skipped,
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
    if (dto.categoryId || dto.categoryEditionId) {
      await this.assertCategoriesInEdition(Number(dto.categoryEditionId || item.categoryEditionId), [dto.categoryId || item.categoryId]);
    }
    Object.assign(item, dto, {
      updatedBy: user?.user_id?.toString() || user?.id?.toString(),
      updateName: user?.user_name || user?.name,
    });
    let saved: TeamRegistrationOrmEntity;
    try {
      saved = await this.repo.save(item);
    } catch (error) {
      if (error?.code === UNIQUE_VIOLATION) throw new BadRequestException('El equipo ya está inscrito en esa categoría de la edición.');
      throw error;
    }

    const targetTeamId = dto.teamId || item.teamId;
    const targetEditionId = dto.categoryEditionId || item.categoryEditionId;
    const targetCategoryId = dto.categoryId || item.categoryId;
    if (targetTeamId && targetEditionId) {
      await this.syncTeamCategoryHistory(targetTeamId, targetEditionId, user, item.companyId, targetCategoryId);
    }

    return this.get(saved.id, companyId);
  }

  async remove(id: string | number, companyId: number, forcePlayers = false) {
    const item = await this.get(id, companyId, true);
    return this.repo.manager.transaction(async (manager) => {
      await this.releaseRegistrations(manager, [item], forcePlayers);
      return manager.getRepository(TeamRegistrationOrmEntity).remove(item);
    });
  }
}
