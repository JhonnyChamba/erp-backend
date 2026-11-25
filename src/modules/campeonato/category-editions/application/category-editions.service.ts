import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, IsNull, Not, Repository } from 'typeorm';
import { PaymentOrmEntity } from '../../infrastructure/persistence/payment.orm-entity';
import { PlayerTransactionOrmEntity } from '../../infrastructure/persistence/player-transaction.orm-entity';
import { SanctionOrmEntity } from '../../infrastructure/persistence/sanction.orm-entity';
import { TeamRegistrationOrmEntity } from '../../infrastructure/persistence/team-registration.orm-entity';
import { PlayerRegistrationOrmEntity } from '../../infrastructure/persistence/player-registration.orm-entity';
import { TeamPaymentOrderOrmEntity } from '../../infrastructure/persistence/team-payment-order.orm-entity';
import { PlayerTransferOrmEntity } from '../../infrastructure/persistence/player-transfer.orm-entity';
import { TournamentTransferConfigOrmEntity } from '../../infrastructure/persistence/tournament-transfer-config.orm-entity';
import { ScenaryOrmEntity } from '../../infrastructure/persistence/scenary.orm-entity';
import { CategoryOrmEntity } from '../../infrastructure/persistence/category.orm-entity';
import { assertBelongsToCompany, ensureCompanyScope } from '../../common/company-scope.util';
import { CategoryEditionOrmEntity } from '../../infrastructure/persistence/category-edition.orm-entity';
import { EditionCategoryDetailOrmEntity } from '../../infrastructure/persistence/edition-category-detail.orm-entity';
import { EditionCategoryClassificationOrmEntity } from '../../infrastructure/persistence/edition-category-classification.orm-entity';
import { EditionCategoryStageOrmEntity } from '../../infrastructure/persistence/edition-category-stage.orm-entity';
import { EditionStageTieBreakerOrmEntity } from '../../infrastructure/persistence/edition-stage-tie-breaker.orm-entity';
import { TieBreakerCriterionOrmEntity } from '../../infrastructure/persistence/tie-breaker-criterion.orm-entity';
import { CreateCategoryEditionDto, EditionCategoryStageItemDto, UpdateCategoryEditionDto } from './dto/category-edition.dto';
import { StageOrmEntity } from '../../infrastructure/persistence/stage.orm-entity';
import { CompetitionTypeOrmEntity } from '../../infrastructure/persistence/competition-type.orm-entity';
import { CompetitionLapOrmEntity } from '../../infrastructure/persistence/competition-lap.orm-entity';
import { MatchOrmEntity } from '../../infrastructure/persistence/match.orm-entity';
import { EditionStatus, PaymentOrderStatus, StageFormat, StageStatus, TeamOrigin } from '../../common/enum/campeonato.enum';

@Injectable()
export class CategoryEditionsService {
  constructor(
    @InjectRepository(CategoryEditionOrmEntity)
    private readonly repo: Repository<CategoryEditionOrmEntity>,
    @InjectRepository(EditionCategoryDetailOrmEntity)
    private readonly detailRepo: Repository<EditionCategoryDetailOrmEntity>,
    @InjectRepository(EditionCategoryClassificationOrmEntity)
    private readonly classificationRepo: Repository<EditionCategoryClassificationOrmEntity>,
    @InjectRepository(EditionCategoryStageOrmEntity)
    private readonly editionStageRepo: Repository<EditionCategoryStageOrmEntity>,
    @InjectRepository(EditionStageTieBreakerOrmEntity)
    private readonly stageTieBreakerRepo: Repository<EditionStageTieBreakerOrmEntity>,
    @InjectRepository(TieBreakerCriterionOrmEntity)
    private readonly tieBreakerRepo: Repository<TieBreakerCriterionOrmEntity>,
    @InjectRepository(ScenaryOrmEntity)
    private readonly scenaryRepo: Repository<ScenaryOrmEntity>,
    @InjectRepository(StageOrmEntity)
    private readonly stageRepo: Repository<StageOrmEntity>,
    @InjectRepository(CompetitionTypeOrmEntity)
    private readonly competitionTypeRepo: Repository<CompetitionTypeOrmEntity>,
    @InjectRepository(CompetitionLapOrmEntity)
    private readonly competitionLapRepo: Repository<CompetitionLapOrmEntity>,
    @InjectRepository(MatchOrmEntity)
    private readonly matchRepo: Repository<MatchOrmEntity>,
  ) {}

  /**
   * Genera (o ajusta) las etapas reales de la edición a partir de las etapas configuradas en cada categoría.
   * Las etapas nuevas nacen PENDIENTES. Una etapa ya iniciada no se modifica, y de las que dejaron de estar configuradas
   * solo se eliminan las pendientes que no tienen partidos.
   */
  async syncStages(editionId: number, user: any) {
    const details = await this.detailRepo.find({ where: { editionId }, relations: ['stages'] });
    const typeIds = new Set<number>();
    const lapIds = new Set<number>();
    for (const detail of details) {
      for (const stage of detail.stages ?? []) {
        if (stage.competitionTypeId) typeIds.add(Number(stage.competitionTypeId));
        if (stage.competitionLapId) lapIds.add(Number(stage.competitionLapId));
      }
    }
    const types = typeIds.size ? await this.competitionTypeRepo.find({ where: { id: In([...typeIds]) } }) : [];
    const laps = lapIds.size ? await this.competitionLapRepo.find({ where: { id: In([...lapIds]) } }) : [];
    const existing = await this.stageRepo.find({ where: { categoryEditionId: editionId } });
    const kept = new Set<number>();
    const actor = { createdBy: user?.user_id?.toString() || user?.id?.toString(), createdName: user?.user_name || user?.name };

    for (const detail of details) {
      const configured = [...(detail.stages ?? [])].sort((a, b) => (Number(a.stageOrder) || 0) - (Number(b.stageOrder) || 0));
      let previousStageId: number | undefined;

      for (let index = 0; index < configured.length; index++) {
        const config = configured[index];
        const stageOrder = Number(config.stageOrder) || index + 1;
        const type = types.find((item) => Number(item.id) === Number(config.competitionTypeId));
        const lap = laps.find((item) => Number(item.id) === Number(config.competitionLapId));
        const values = {
          name: String(config.name || `Etapa ${stageOrder}`).trim(),
          stageOrder,
          categoryId: Number(detail.categoryId),
          competitionTypeCode: type?.code ?? null,
          format: type?.code === 'PLAY_OFF' ? StageFormat.DIRECT_ELIMINATION : StageFormat.EVERYONE_AGAINST_EVERYONE,
          numberOfLaps: Number(lap?.numberOfLaps) > 0 ? Number(lap.numberOfLaps) : 1,
          teamOrigin: index === 0 ? TeamOrigin.FULL_CATEGORY : TeamOrigin.PREVIOUS_STAGE,
          previousStageId: previousStageId ?? null,
          fromEdition: true,
        };

        const current = existing.find((stage) => Number(stage.categoryId) === Number(detail.categoryId) && Number(stage.stageOrder) === stageOrder);
        let saved: StageOrmEntity;
        if (current) {
          saved = current.status === StageStatus.PENDING ? await this.stageRepo.save(Object.assign(current, values, { updatedBy: actor.createdBy, updateName: actor.createdName })) : current;
        } else {
          saved = await this.stageRepo.save(this.stageRepo.create({ ...values, categoryEditionId: editionId, companyId: detail.companyId, status: StageStatus.PENDING, ...actor } as Partial<StageOrmEntity>));
        }
        kept.add(saved.id);
        previousStageId = saved.id;
      }
    }

    for (const stage of existing.filter((item) => item.fromEdition && !kept.has(item.id) && item.status === StageStatus.PENDING)) {
      if ((await this.matchRepo.count({ where: { stageId: stage.id } })) === 0) await this.stageRepo.remove(stage);
    }
  }

  /**
   * Inicia el campeonato de una categoría de la edición (una sola vez por categoría): su primera etapa pasa a EN PROCESO.
   * La edición queda EN CURSO desde que se inicia su primera categoría.
   */
  async start(id: string | number, categoryId: string | number, user: any, companyId: number) {
    const edition = await this.get(Number(id), companyId, true);
    if (edition.status === EditionStatus.COMPLETED || edition.status === EditionStatus.CANCELLED) {
      throw new BadRequestException('No se puede iniciar el campeonato de una edición finalizada o cancelada.');
    }

    const detail = (edition.categoriesDetail ?? []).find((item) => Number(item.categoryId) === Number(categoryId));
    if (!detail) {
      throw new BadRequestException('La categoría no pertenece a esta edición de torneo.');
    }
    if (detail.startedAt) {
      throw new BadRequestException('El campeonato de esta categoría ya fue iniciado; solo se puede iniciar una vez.');
    }

    await this.syncStages(edition.id, user);
    const stages = await this.stageRepo.find({ where: { categoryEditionId: edition.id, categoryId: detail.categoryId, fromEdition: true }, order: { stageOrder: 'ASC' } });
    if (stages.length === 0) {
      throw new BadRequestException('La categoría no tiene etapas configuradas. Agrega sus etapas en la edición antes de iniciar el campeonato.');
    }

    const now = new Date();
    const actor = { updatedBy: user?.user_id?.toString() || user?.id?.toString(), updateName: user?.user_name || user?.name };
    await this.repo.manager.transaction(async (manager) => {
      // Condicionado a que siga sin iniciarse: dos clics seguidos no inician dos veces
      const started = await manager.getRepository(EditionCategoryDetailOrmEntity).update({ id: detail.id, startedAt: IsNull() }, { startedAt: now, startedName: actor.updateName, ...actor });
      if (!started.affected) throw new BadRequestException('El campeonato de esta categoría ya fue iniciado; solo se puede iniciar una vez.');

      await manager.getRepository(StageOrmEntity).update(stages[0].id, { status: StageStatus.IN_PROGRESS, startedAt: now });
      await manager.getRepository(CategoryEditionOrmEntity).update({ id: edition.id, startedAt: IsNull() }, { status: EditionStatus.IN_PROGRESS, startedAt: now, startedName: actor.updateName, ...actor });
    });

    return this.getForm(edition.id, companyId);
  }

  /** Normaliza los ids de escenarios a enteros únicos y valida que pertenezcan a la empresa activa. */
  private async resolveScenaryIds(raw: unknown, companyId: number): Promise<number[]> {
    const ids = [...new Set((Array.isArray(raw) ? raw : []).map((v) => Number(v)).filter((v) => Number.isInteger(v) && v > 0))];
    if (ids.length === 0) return [];
    const found = await this.scenaryRepo.find({ where: { id: In(ids) } });
    for (const id of ids) {
      ensureCompanyScope(found.find((s) => Number(s.id) === id), companyId, 'Escenario no encontrado');
    }
    return ids;
  }

  /** Las categorías referenciadas (cabecera y detalle) deben pertenecer a la empresa activa. */
  private async assertCategories(dto: CreateCategoryEditionDto | UpdateCategoryEditionDto, companyId: number) {
    const categoryRepo = this.repo.manager.getRepository(CategoryOrmEntity);
    const ids = new Set<number>([dto.categoryId, ...(dto.categoriesDetail || []).map((d) => d.categoryId)].filter(Boolean).map((v) => Number(v)));
    for (const id of ids) {
      await assertBelongsToCompany(categoryRepo, id, companyId, 'Categoría no encontrada');
    }
  }

  /** Los tipos de competencia, las vueltas y los criterios de desempate de las etapas deben existir (evita un error de llave foránea a mitad de la escritura). */
  private async assertStageReferences(details: { stages?: EditionCategoryStageItemDto[] }[] | undefined) {
    const typeIds = new Set<number>();
    const lapIds = new Set<number>();
    const criterionIds = new Set<number>();
    for (const stage of (details ?? []).flatMap((detail) => detail.stages ?? [])) {
      if (stage.competitionTypeId) typeIds.add(Number(stage.competitionTypeId));
      if (stage.competitionLapId) lapIds.add(Number(stage.competitionLapId));
      for (const id of this.stageCriterionIds(stage)) criterionIds.add(id);
    }

    // Son catálogos de Configuración General del Sistema: globales, no pertenecen a ninguna empresa (solo se comprueba que existan).
    const checks: [Set<number>, Repository<{ id: number }>, string][] = [
      [typeIds, this.competitionTypeRepo, 'Tipo de competencia no encontrado'],
      [lapIds, this.competitionLapRepo, 'Modalidad de vueltas no encontrada'],
      [criterionIds, this.tieBreakerRepo, 'Criterio de desempate no encontrado'],
    ];
    for (const [ids, repository, message] of checks) {
      if (ids.size === 0) continue;
      const found = await repository.count({ where: { id: In([...ids]) } });
      if (found !== ids.size) throw new BadRequestException(message);
    }
  }

  /** Ids de los criterios de desempate de una etapa, sin repetir y en orden de prioridad (si solo llega el criterio único antiguo, es el primero). */
  private stageCriterionIds(stage: EditionCategoryStageItemDto): number[] {
    const ordered = [...(stage.tieBreakerCriteria ?? [])]
      .map((criterion, index) => ({ id: Number(criterion.criterionId ?? criterion.id), order: Number(criterion.order) || index + 1, index }))
      .filter((criterion) => Number.isInteger(criterion.id) && criterion.id > 0)
      .sort((a, b) => a.order - b.order || a.index - b.index)
      .map((criterion) => criterion.id);
    if (ordered.length === 0 && Number(stage.tieBreakerCriterionId) > 0) ordered.push(Number(stage.tieBreakerCriterionId));
    return [...new Set(ordered)];
  }

  /** Guarda las etapas de una categoría de la edición, cada una con sus criterios de desempate en orden de prioridad. */
  private async saveStages(categoryDetailId: number, stages: EditionCategoryStageItemDto[] | undefined, companyId: number, actor: { createdBy?: string; createdName?: string }) {
    for (const [index, stage] of (stages ?? []).entries()) {
      const stageOrder = Number(stage.stageOrder) || index + 1;
      const saved = await this.editionStageRepo.save(
        this.editionStageRepo.create({
          categoryDetailId,
          stageOrder,
          name: String(stage.name || `Etapa ${stageOrder}`).trim(),
          competitionTypeId: stage.competitionTypeId ? Number(stage.competitionTypeId) : null,
          competitionLapId: stage.competitionLapId ? Number(stage.competitionLapId) : null,
          companyId,
          ...actor,
        }),
      );

      const criterionIds = this.stageCriterionIds(stage);
      if (criterionIds.length > 0) {
        await this.stageTieBreakerRepo.save(
          criterionIds.map((tieBreakerCriterionId, position) => this.stageTieBreakerRepo.create({ editionStageId: saved.id, tieBreakerCriterionId, priorityOrder: position + 1, companyId, ...actor })),
        );
      }
    }
  }

  /**
   * Respuesta de una edición para el formulario: cada categoría trae sus etapas (`stages`) y cada etapa sus criterios de desempate
   * (`tieBreakerCriteria`, en orden), con los textos que muestra la pantalla. Devuelve un objeto nuevo: no se guarda de vuelta.
   */
  private present(edition: CategoryEditionOrmEntity) {
    return {
      ...edition,
      categoriesDetail: (edition.categoriesDetail ?? []).map(({ legacyStages: _legacyStages, ...detail }) => ({
        ...detail,
        stages: [...(detail.stages ?? [])]
          .sort((a, b) => a.stageOrder - b.stageOrder || a.id - b.id)
          .map((stage) => {
            const criteria = [...(stage.tieBreakers ?? [])]
              .sort((a, b) => a.priorityOrder - b.priorityOrder)
              .map((item) => ({
                criterionId: item.tieBreakerCriterionId,
                id: item.tieBreakerCriterionId,
                description: item.tieBreakerCriterion?.description ?? '',
                code: item.tieBreakerCriterion?.code ?? '',
                observation: item.tieBreakerCriterion?.observation ?? '',
                order: item.priorityOrder,
              }));
            return {
              id: stage.id,
              stageOrder: stage.stageOrder,
              name: stage.name,
              competitionTypeId: stage.competitionTypeId,
              competitionTypeDescription: stage.competitionType?.description ?? '',
              competitionLapId: stage.competitionLapId,
              competitionLapDescription: stage.competitionLap?.description ?? '',
              tieBreakerCriteria: criteria,
              tieBreakerCriterionId: criteria[0]?.criterionId ?? null,
              tieBreakerCriterionDescription: criteria[0]?.description ?? null,
            };
          }),
      })),
    };
  }

  async list(companyId: number, query: { page?: number; limit?: number; search?: string }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const qb = this.repo
      .createQueryBuilder('ce')
      .leftJoinAndSelect('ce.category', 'category')
      .leftJoinAndSelect('ce.categoriesDetail', 'categoriesDetail')
      .leftJoinAndSelect('categoriesDetail.category', 'detailCategory')
      .leftJoinAndSelect('categoriesDetail.classifications', 'classifications')
      .leftJoinAndSelect('classifications.playerClassification', 'playerClassification')
      .leftJoinAndSelect('categoriesDetail.stages', 'stages')
      .leftJoinAndSelect('stages.competitionType', 'competitionType')
      .leftJoinAndSelect('stages.competitionLap', 'competitionLap')
      .leftJoinAndSelect('stages.tieBreakers', 'tieBreakers')
      .leftJoinAndSelect('tieBreakers.tieBreakerCriterion', 'tieBreakerCriterion');

    if (companyId) {
      qb.andWhere('(ce.companyId = :companyId OR ce.companyId IS NULL)', { companyId });
    }
    if (query.search?.trim()) {
      qb.andWhere('(LOWER(ce.name) LIKE :term OR LOWER(category.name) LIKE :term OR LOWER(categoriesDetail.categoryDescription) LIKE :term)', {
        term: `%${query.search.trim().toLowerCase()}%`,
      });
    }

    qb.orderBy('ce.createdAt', 'DESC').skip(skip).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data: data.map((edition) => this.present(edition)), total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async get(id: string | number, companyId: number, write = false) {
    const item = await this.repo.findOne({
      where: { id: Number(id) },
      relations: [
        'category',
        'categoriesDetail',
        'categoriesDetail.category',
        'categoriesDetail.classifications',
        'categoriesDetail.classifications.playerClassification',
        'categoriesDetail.stages',
        'categoriesDetail.stages.competitionType',
        'categoriesDetail.stages.competitionLap',
        'categoriesDetail.stages.tieBreakers',
        'categoriesDetail.stages.tieBreakers.tieBreakerCriterion',
      ],
    });
    return ensureCompanyScope(item, companyId, 'Edición de torneo no encontrada', write);
  }

  /** Edición con la forma que usa el formulario (ver `present`). */
  async getForm(id: string | number, companyId: number) {
    return this.present(await this.get(id, companyId));
  }

  private validateCategoryDetails(categoriesDetail: any[]) {
    for (const det of categoriesDetail) {
      const maxLimit = Number(det.maxPlayers) > 0 ? Number(det.maxPlayers) : 25;
      if (det.useClassifications && det.classifications && det.classifications.length > 0) {
        const sumClass = det.classifications.reduce((acc: number, c: any) => acc + (Number(c.maxPlayers) || 0), 0);
        if (sumClass > maxLimit) {
          throw new BadRequestException(
            `La suma de las clasificaciones (${sumClass}) para la categoría "${det.categoryDescription || 'Categoría'}" no puede superar el máximo de jugadores inscritos permitidos (${maxLimit}).`,
          );
        }
      }
    }
  }

  async create(dto: CreateCategoryEditionDto, user: any, companyId: number) {
    const { categoriesDetail, ...editionData } = dto;
    if (categoriesDetail && categoriesDetail.length > 0) {
      this.validateCategoryDetails(categoriesDetail);
    }
    await this.assertCategories(dto, companyId);
    await this.assertStageReferences(categoriesDetail);
    const scenaryIds = await this.resolveScenaryIds(dto.availableScenaryIds, companyId);

    const item = this.repo.create({
      ...editionData,
      // La edición nace pendiente: pasa a EN CURSO al iniciar el campeonato
      status: EditionStatus.PENDING,
      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      matchDurationMinutes: dto.matchDurationMinutes ? Number(dto.matchDurationMinutes) : 60,
      breakDurationMinutes: dto.breakDurationMinutes !== undefined ? Number(dto.breakDurationMinutes) : 10,
      waitBetweenMatchesMinutes: dto.waitBetweenMatchesMinutes !== undefined ? Number(dto.waitBetweenMatchesMinutes) : 10,
      availableScenaryIds: scenaryIds,
      companyId,
      createdBy: user?.user_id?.toString() || user?.id?.toString(),
      createdName: user?.user_name || user?.name,
    });
    const saved = await this.repo.save(item);

    if (categoriesDetail && categoriesDetail.length > 0) {
      for (const det of categoriesDetail) {
        const detailEntity = this.detailRepo.create({
          editionId: saved.id,
          categoryId: det.categoryId,
          categoryDescription: det.categoryDescription,
          startDate: det.startDate ? new Date(det.startDate) : undefined,
          endDate: det.endDate ? new Date(det.endDate) : undefined,
          registrationFee: det.registrationFee || 0,
          guaranteeFee: det.guaranteeFee || 0,
          maxPlayers: Number(det.maxPlayers) > 0 ? Number(det.maxPlayers) : 25,
          useClassifications: Boolean(det.useClassifications),
          matchDurationMinutes: det.matchDurationMinutes !== undefined && det.matchDurationMinutes !== null ? Number(det.matchDurationMinutes) : 60,
          breakDurationMinutes: det.breakDurationMinutes !== undefined && det.breakDurationMinutes !== null ? Number(det.breakDurationMinutes) : 10,
          waitBetweenMatchesMinutes: det.waitBetweenMatchesMinutes !== undefined && det.waitBetweenMatchesMinutes !== null ? Number(det.waitBetweenMatchesMinutes) : 10,
          companyId,
          createdBy: user?.user_id?.toString() || user?.id?.toString(),
          createdName: user?.user_name || user?.name,
        });
        const savedDetail = await this.detailRepo.save(detailEntity);
        await this.saveStages(savedDetail.id, det.stages, companyId, { createdBy: user?.user_id?.toString() || user?.id?.toString(), createdName: user?.user_name || user?.name });

        if (det.useClassifications && det.classifications && det.classifications.length > 0) {
          const classEntities = det.classifications.map((c: any) =>
            this.classificationRepo.create({
              categoryDetailId: savedDetail.id,
              playerClassificationId: c.playerClassificationId,
              maxPlayers: Number(c.maxPlayers) || 0,
              maxInactivityMonths: c.maxInactivityMonths !== undefined && c.maxInactivityMonths !== null && c.maxInactivityMonths !== '' ? Number(c.maxInactivityMonths) : null,
              maxMonths: c.maxMonths !== undefined && c.maxMonths !== null && c.maxMonths !== '' ? Number(c.maxMonths) : null,
              companyId,
              createdBy: user?.user_id?.toString() || user?.id?.toString(),
              createdName: user?.user_name || user?.name,
            }),
          );
          await this.classificationRepo.save(classEntities);
        }
      }
    }

    // Todas las etapas configuradas se generan en estado pendiente
    await this.syncStages(saved.id, user);

    return this.getForm(saved.id, companyId);
  }

  async update(id: string | number, dto: UpdateCategoryEditionDto, user: any, companyId: number) {
    const numId = Number(id);
    const item = await this.get(numId, companyId, true);
    const { categoriesDetail, ...editionData } = dto;

    if (categoriesDetail !== undefined && categoriesDetail.length > 0) {
      this.validateCategoryDetails(categoriesDetail);
    }
    await this.assertCategories(dto, companyId);
    await this.assertStageReferences(categoriesDetail);
    const scenaryIds = dto.availableScenaryIds !== undefined ? await this.resolveScenaryIds(dto.availableScenaryIds, companyId) : undefined;

    // Una edición pendiente solo pasa a EN CURSO con la acción «Iniciar campeonato»
    if (!item.startedAt && editionData.status === EditionStatus.IN_PROGRESS) delete editionData.status;

    Object.assign(item, editionData, {
      startDate: dto.startDate ? new Date(dto.startDate) : item.startDate,
      endDate: dto.endDate ? new Date(dto.endDate) : item.endDate,
      matchDurationMinutes: dto.matchDurationMinutes !== undefined ? Number(dto.matchDurationMinutes) : item.matchDurationMinutes,
      breakDurationMinutes: dto.breakDurationMinutes !== undefined ? Number(dto.breakDurationMinutes) : item.breakDurationMinutes,
      waitBetweenMatchesMinutes: dto.waitBetweenMatchesMinutes !== undefined ? Number(dto.waitBetweenMatchesMinutes) : item.waitBetweenMatchesMinutes,
      availableScenaryIds: scenaryIds !== undefined ? scenaryIds : item.availableScenaryIds,
      updatedBy: user?.user_id?.toString() || user?.id?.toString(),
      updateName: user?.user_name || user?.name,
    });
    await this.repo.save(item);

    if (categoriesDetail !== undefined) {
      // Eliminar detalles previos y clasificaciones asociadas
      const oldDetails = await this.detailRepo.find({ where: { editionId: numId } });
      for (const od of oldDetails) {
        await this.classificationRepo.delete({ categoryDetailId: od.id });
      }
      await this.detailRepo.delete({ editionId: numId });

      if (categoriesDetail.length > 0) {
        for (const det of categoriesDetail) {
          const detailEntity = this.detailRepo.create({
            editionId: numId,
            categoryId: Number(det.categoryId),
            categoryDescription: det.categoryDescription,
            startDate: det.startDate ? new Date(det.startDate) : undefined,
            endDate: det.endDate ? new Date(det.endDate) : undefined,
            registrationFee: det.registrationFee || 0,
            guaranteeFee: det.guaranteeFee || 0,
            maxPlayers: Number(det.maxPlayers) > 0 ? Number(det.maxPlayers) : 25,
            useClassifications: Boolean(det.useClassifications),
            matchDurationMinutes: det.matchDurationMinutes !== undefined && det.matchDurationMinutes !== null ? Number(det.matchDurationMinutes) : 60,
            breakDurationMinutes: det.breakDurationMinutes !== undefined && det.breakDurationMinutes !== null ? Number(det.breakDurationMinutes) : 10,
            waitBetweenMatchesMinutes: det.waitBetweenMatchesMinutes !== undefined && det.waitBetweenMatchesMinutes !== null ? Number(det.waitBetweenMatchesMinutes) : 10,
            // El detalle se vuelve a crear en cada modificación: la categoría ya iniciada conserva su inicio
            startedAt: oldDetails.find((od) => Number(od.categoryId) === Number(det.categoryId))?.startedAt ?? undefined,
            startedName: oldDetails.find((od) => Number(od.categoryId) === Number(det.categoryId))?.startedName ?? undefined,
            companyId: item.companyId,
            createdBy: user?.user_id?.toString() || user?.id?.toString(),
            createdName: user?.user_name || user?.name,
          });
          const savedDetail: EditionCategoryDetailOrmEntity = await this.detailRepo.save(detailEntity);
          await this.saveStages(savedDetail.id, det.stages, item.companyId, { createdBy: user?.user_id?.toString() || user?.id?.toString(), createdName: user?.user_name || user?.name });

          if (det.useClassifications && det.classifications && det.classifications.length > 0) {
            const classEntities = det.classifications.map((c: any) =>
              this.classificationRepo.create({
                categoryDetailId: savedDetail.id,
                playerClassificationId: Number(c.playerClassificationId),
                maxPlayers: Number(c.maxPlayers) || 0,
                maxInactivityMonths: c.maxInactivityMonths !== undefined && c.maxInactivityMonths !== null && c.maxInactivityMonths !== '' ? Number(c.maxInactivityMonths) : null,
                maxMonths: c.maxMonths !== undefined && c.maxMonths !== null && c.maxMonths !== '' ? Number(c.maxMonths) : null,
                companyId: item.companyId,
                createdBy: user?.user_id?.toString() || user?.id?.toString(),
                createdName: user?.user_name || user?.name,
              }),
            );
            await this.classificationRepo.save(classEntities);
          }
        }
      }
    }

    // Las etapas pendientes siguen la configuración de cada categoría (las ya iniciadas no se modifican): con el inicio por categoría, una edición en curso todavía puede tener categorías sin iniciar
    if (categoriesDetail !== undefined) {
      await this.syncStages(numId, user);
    }

    return this.getForm(numId, companyId);
  }

  /** Ids de lo que cuelga de la edición y se borra con ella. Se buscan solo por la edición: incluye registros de otras empresas. */
  private async collectDeletionIds(editionId: number, manager: EntityManager) {
    const ids = async <T extends { id: number }>(entity: new () => T, where: object) => (await manager.getRepository(entity).find({ select: { id: true } as never, where: where as never })).map((row) => Number(row.id));
    const detailIds = await ids(EditionCategoryDetailOrmEntity, { editionId });
    const stageIds = await ids(StageOrmEntity, { categoryEditionId: editionId });
    const registrationIds = await ids(TeamRegistrationOrmEntity, { categoryEditionId: editionId });
    const configStageIds = detailIds.length ? await ids(EditionCategoryStageOrmEntity, { categoryDetailId: In(detailIds) }) : [];
    const matchIds = stageIds.length ? await ids(MatchOrmEntity, { stageId: In(stageIds) }) : [];
    return { detailIds, stageIds, registrationIds, configStageIds, matchIds };
  }

  /** Lo que se eliminaría junto con la edición, para mostrarlo antes de confirmar. */
  async deletionSummary(id: string | number, companyId: number) {
    const edition = await this.get(id, companyId, true);
    const manager = this.repo.manager;
    const { detailIds, stageIds, registrationIds, configStageIds, matchIds } = await this.collectDeletionIds(edition.id, manager);
    const count = async (entity: any, where: object) => manager.getRepository(entity).count({ where: where as never });
    const orders = (status: PaymentOrderStatus) => count(TeamPaymentOrderOrmEntity, { categoryEditionId: edition.id, status });
    // Registros creados por otra empresa a partir de esta edición (también se eliminan)
    const other = { companyId: Not(edition.companyId) };

    return {
      editionId: edition.id,
      name: edition.name,
      categories: detailIds.length,
      configuredStages: configStageIds.length,
      stages: stageIds.length,
      matches: matchIds.length,
      teamRegistrations: registrationIds.length,
      playerRegistrations: registrationIds.length ? await count(PlayerRegistrationOrmEntity, { teamRegistrationId: In(registrationIds) }) : 0,
      payments: registrationIds.length ? await count(PaymentOrmEntity, { teamRegistrationId: In(registrationIds) }) : 0,
      paymentOrders: { pending: await orders(PaymentOrderStatus.PENDING), cancelled: await orders(PaymentOrderStatus.CANCELLED), paid: await orders(PaymentOrderStatus.PAID) },
      playerTransfers: await count(PlayerTransferOrmEntity, { editionId: edition.id }),
      playerTransactions: await count(PlayerTransactionOrmEntity, { editionId: edition.id }),
      sanctions: matchIds.length ? await count(SanctionOrmEntity, { matchId: In(matchIds) }) : 0,
      otherCompanies: {
        teamRegistrations: await count(TeamRegistrationOrmEntity, { categoryEditionId: edition.id, ...other }),
        paymentOrders: await count(TeamPaymentOrderOrmEntity, { categoryEditionId: edition.id, ...other }),
        playerTransfers: await count(PlayerTransferOrmEntity, { editionId: edition.id, ...other }),
      },
    };
  }

  /**
   * Elimina la edición con TODO lo que se creó a partir de ella, en una sola transacción y sin filtrar por empresa (incluye lo que
   * otra empresa haya creado en esta edición): configuración (categorías, clasificaciones, etapas y criterios de desempate), reglas de
   * pases, etapas reales con sus partidos y sanciones, inscripciones de equipos y de jugadores, pagos, órdenes de pago (también las
   * pagadas), pases y movimientos de jugadores. Opción de pruebas: se retirará después.
   */
  async remove(id: string | number, companyId: number) {
    const summary = await this.deletionSummary(id, companyId);

    const editionId = summary.editionId;
    await this.repo.manager.transaction(async (manager) => {
      const { detailIds, stageIds, registrationIds, configStageIds, matchIds } = await this.collectDeletionIds(editionId, manager);

      if (matchIds.length) await manager.delete(SanctionOrmEntity, { matchId: In(matchIds) });
      if (registrationIds.length) await manager.delete(PaymentOrmEntity, { teamRegistrationId: In(registrationIds) });
      await manager.delete(PlayerTransferOrmEntity, { editionId });
      await manager.delete(PlayerTransactionOrmEntity, { editionId });
      await manager.delete(TeamPaymentOrderOrmEntity, { categoryEditionId: editionId });
      if (stageIds.length) await manager.delete(MatchOrmEntity, { stageId: In(stageIds) });
      if (registrationIds.length) await manager.delete(PlayerRegistrationOrmEntity, { teamRegistrationId: In(registrationIds) });
      await manager.delete(TeamRegistrationOrmEntity, { categoryEditionId: editionId });
      await manager.delete(StageOrmEntity, { categoryEditionId: editionId });
      await manager.delete(TournamentTransferConfigOrmEntity, { editionId });

      if (configStageIds.length) await manager.delete(EditionStageTieBreakerOrmEntity, { editionStageId: In(configStageIds) });
      if (detailIds.length) {
        await manager.delete(EditionCategoryStageOrmEntity, { categoryDetailId: In(detailIds) });
        await manager.delete(EditionCategoryClassificationOrmEntity, { categoryDetailId: In(detailIds) });
      }
      await manager.delete(EditionCategoryDetailOrmEntity, { editionId });
      await manager.delete(CategoryEditionOrmEntity, { id: editionId });
    });

    return { success: true, deleted: summary };
  }
}
