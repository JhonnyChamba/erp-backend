import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';
import { EditionScenaryOrmEntity } from '../../infrastructure/persistence/edition-scenary.orm-entity';
import { ScenaryOrmEntity } from '../../infrastructure/persistence/scenary.orm-entity';
import { CategoryOrmEntity } from '../../infrastructure/persistence/category.orm-entity';
import { assertBelongsToCompany, ensureCompanyScope } from '../../common/company-scope.util';
import { CategoryEditionOrmEntity } from '../../infrastructure/persistence/category-edition.orm-entity';
import { EditionCategoryDetailOrmEntity } from '../../infrastructure/persistence/edition-category-detail.orm-entity';
import { EditionCategoryClassificationOrmEntity } from '../../infrastructure/persistence/edition-category-classification.orm-entity';
import { CreateCategoryEditionDto, UpdateCategoryEditionDto } from './dto/category-edition.dto';
import { StageOrmEntity } from '../../infrastructure/persistence/stage.orm-entity';
import { CompetitionTypeOrmEntity } from '../../infrastructure/persistence/competition-type.orm-entity';
import { CompetitionLapOrmEntity } from '../../infrastructure/persistence/competition-lap.orm-entity';
import { MatchOrmEntity } from '../../infrastructure/persistence/match.orm-entity';
import { EditionStatus, StageFormat, StageStatus, TeamOrigin } from '../../common/enum/campeonato.enum';

@Injectable()
export class CategoryEditionsService {
  constructor(
    @InjectRepository(CategoryEditionOrmEntity)
    private readonly repo: Repository<CategoryEditionOrmEntity>,
    @InjectRepository(EditionCategoryDetailOrmEntity)
    private readonly detailRepo: Repository<EditionCategoryDetailOrmEntity>,
    @InjectRepository(EditionCategoryClassificationOrmEntity)
    private readonly classificationRepo: Repository<EditionCategoryClassificationOrmEntity>,
    @InjectRepository(EditionScenaryOrmEntity)
    private readonly editionScenaryRepo: Repository<EditionScenaryOrmEntity>,
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
    const details = await this.detailRepo.find({ where: { editionId } });
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

    return this.get(edition.id, companyId);
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

  /** Reemplaza los escenarios habilitados de la edición (tab_campeonato_edition_scenaries). */
  private async replaceEditionScenaries(editionId: number, scenaryIds: number[], companyId: number) {
    await this.editionScenaryRepo.delete({ editionId });
    if (scenaryIds.length > 0) {
      await this.editionScenaryRepo.save(scenaryIds.map((scenaryId) => this.editionScenaryRepo.create({ editionId, scenaryId, companyId })));
    }
  }

  /** Las categorías referenciadas (cabecera y detalle) deben pertenecer a la empresa activa. */
  private async assertCategories(dto: CreateCategoryEditionDto | UpdateCategoryEditionDto, companyId: number) {
    const categoryRepo = this.repo.manager.getRepository(CategoryOrmEntity);
    const ids = new Set<number>([dto.categoryId, ...(dto.categoriesDetail || []).map((d) => d.categoryId)].filter(Boolean).map((v) => Number(v)));
    for (const id of ids) {
      await assertBelongsToCompany(categoryRepo, id, companyId, 'Categoría no encontrada');
    }
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
      .leftJoinAndSelect('classifications.playerClassification', 'playerClassification');

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
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
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
      ],
    });
    return ensureCompanyScope(item, companyId, 'Edición de torneo no encontrada', write);
  }

  private validateCategoryDetails(categoriesDetail: any[]) {
    for (const det of categoriesDetail) {
      const maxLimit = Number(det.maxPlayers) > 0 ? Number(det.maxPlayers) : 25;
      if (det.classifications && det.classifications.length > 0) {
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

    await this.replaceEditionScenaries(saved.id, scenaryIds, companyId);

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
          matchDurationMinutes: det.matchDurationMinutes !== undefined && det.matchDurationMinutes !== null ? Number(det.matchDurationMinutes) : 60,
          breakDurationMinutes: det.breakDurationMinutes !== undefined && det.breakDurationMinutes !== null ? Number(det.breakDurationMinutes) : 10,
          waitBetweenMatchesMinutes: det.waitBetweenMatchesMinutes !== undefined && det.waitBetweenMatchesMinutes !== null ? Number(det.waitBetweenMatchesMinutes) : 10,
          stages: Array.isArray(det.stages) ? det.stages : [],
          companyId,
          createdBy: user?.user_id?.toString() || user?.id?.toString(),
          createdName: user?.user_name || user?.name,
        });
        const savedDetail = await this.detailRepo.save(detailEntity);

        if (det.classifications && det.classifications.length > 0) {
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

    return this.get(saved.id, companyId);
  }

  async update(id: string | number, dto: UpdateCategoryEditionDto, user: any, companyId: number) {
    const numId = Number(id);
    const item = await this.get(numId, companyId, true);
    const { categoriesDetail, ...editionData } = dto;

    if (categoriesDetail !== undefined && categoriesDetail.length > 0) {
      this.validateCategoryDetails(categoriesDetail);
    }
    await this.assertCategories(dto, companyId);
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

    if (scenaryIds !== undefined) {
      await this.replaceEditionScenaries(numId, scenaryIds, item.companyId);
    }

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
            matchDurationMinutes: det.matchDurationMinutes !== undefined && det.matchDurationMinutes !== null ? Number(det.matchDurationMinutes) : 60,
            breakDurationMinutes: det.breakDurationMinutes !== undefined && det.breakDurationMinutes !== null ? Number(det.breakDurationMinutes) : 10,
            waitBetweenMatchesMinutes: det.waitBetweenMatchesMinutes !== undefined && det.waitBetweenMatchesMinutes !== null ? Number(det.waitBetweenMatchesMinutes) : 10,
            stages: Array.isArray(det.stages) ? det.stages : [],
            // El detalle se vuelve a crear en cada modificación: la categoría ya iniciada conserva su inicio
            startedAt: oldDetails.find((od) => Number(od.categoryId) === Number(det.categoryId))?.startedAt ?? undefined,
            startedName: oldDetails.find((od) => Number(od.categoryId) === Number(det.categoryId))?.startedName ?? undefined,
            companyId: item.companyId,
            createdBy: user?.user_id?.toString() || user?.id?.toString(),
            createdName: user?.user_name || user?.name,
          });
          const savedDetail: EditionCategoryDetailOrmEntity = await this.detailRepo.save(detailEntity);

          if (det.classifications && det.classifications.length > 0) {
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

    return this.get(numId, companyId, true);
  }

  async remove(id: string | number, companyId: number) {
    const numId = Number(id);
    const item = await this.get(numId, companyId, true);
    const oldDetails = await this.detailRepo.find({ where: { editionId: numId } });
    for (const od of oldDetails) {
      await this.classificationRepo.delete({ categoryDetailId: od.id });
    }
    await this.detailRepo.delete({ editionId: numId });
    await this.editionScenaryRepo.delete({ editionId: numId });
    return this.repo.remove(item);
  }
}
