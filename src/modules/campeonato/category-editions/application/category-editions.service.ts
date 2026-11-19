import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoryEditionOrmEntity } from '../../infrastructure/persistence/category-edition.orm-entity';
import { EditionCategoryDetailOrmEntity } from '../../infrastructure/persistence/edition-category-detail.orm-entity';
import { EditionCategoryClassificationOrmEntity } from '../../infrastructure/persistence/edition-category-classification.orm-entity';
import { CreateCategoryEditionDto, UpdateCategoryEditionDto } from './dto/category-edition.dto';
import { EditionStatus } from '../../common/enum/campeonato.enum';

@Injectable()
export class CategoryEditionsService {
  constructor(
    @InjectRepository(CategoryEditionOrmEntity)
    private readonly repo: Repository<CategoryEditionOrmEntity>,
    @InjectRepository(EditionCategoryDetailOrmEntity)
    private readonly detailRepo: Repository<EditionCategoryDetailOrmEntity>,
    @InjectRepository(EditionCategoryClassificationOrmEntity)
    private readonly classificationRepo: Repository<EditionCategoryClassificationOrmEntity>,
  ) {}

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

  async get(id: string | number) {
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
    if (!item) throw new NotFoundException('Edición de torneo no encontrada');
    return item;
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

    const item = this.repo.create({
      ...editionData,
      status: dto.status || EditionStatus.IN_PROGRESS,
      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      matchDurationMinutes: dto.matchDurationMinutes ? Number(dto.matchDurationMinutes) : 60,
      breakDurationMinutes: dto.breakDurationMinutes !== undefined ? Number(dto.breakDurationMinutes) : 10,
      waitBetweenMatchesMinutes: dto.waitBetweenMatchesMinutes !== undefined ? Number(dto.waitBetweenMatchesMinutes) : 10,
      availableScenaryIds: Array.isArray(dto.availableScenaryIds) ? dto.availableScenaryIds : [],
      companyId,
      createdBy: user?.user_id?.toString() || user?.id?.toString(),
      createdName: user?.user_name || user?.name,
    });
    const saved = await this.repo.save(item);

    if (Array.isArray(dto.availableScenaryIds) && dto.availableScenaryIds.length > 0) {
      for (const scId of dto.availableScenaryIds) {
        if (scId) {
          await this.repo.query('INSERT INTO tab_campeonato_edition_scenaries (edition_id, scenary_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [saved.id, scId]);
        }
      }
    }

    if (categoriesDetail && categoriesDetail.length > 0) {
      for (const det of categoriesDetail) {
        const detailEntity = this.detailRepo.create({
          editionId: saved.id,
          categoryId: det.categoryId,
          categoryDescription: det.categoryDescription,
          startDate: det.startDate ? new Date(det.startDate) : undefined,
          endDate: det.endDate ? new Date(det.endDate) : undefined,
          registrationFee: det.registrationFee || 0,
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

    return this.get(saved.id);
  }

  async update(id: string | number, dto: UpdateCategoryEditionDto, user: any) {
    const numId = Number(id);
    const item = await this.get(numId);
    const { categoriesDetail, ...editionData } = dto;

    if (categoriesDetail !== undefined && categoriesDetail.length > 0) {
      this.validateCategoryDetails(categoriesDetail);
    }

    Object.assign(item, editionData, {
      startDate: dto.startDate ? new Date(dto.startDate) : item.startDate,
      endDate: dto.endDate ? new Date(dto.endDate) : item.endDate,
      matchDurationMinutes: dto.matchDurationMinutes !== undefined ? Number(dto.matchDurationMinutes) : item.matchDurationMinutes,
      breakDurationMinutes: dto.breakDurationMinutes !== undefined ? Number(dto.breakDurationMinutes) : item.breakDurationMinutes,
      waitBetweenMatchesMinutes: dto.waitBetweenMatchesMinutes !== undefined ? Number(dto.waitBetweenMatchesMinutes) : item.waitBetweenMatchesMinutes,
      availableScenaryIds: dto.availableScenaryIds !== undefined ? (Array.isArray(dto.availableScenaryIds) ? dto.availableScenaryIds : []) : item.availableScenaryIds,
      updatedBy: user?.user_id?.toString() || user?.id?.toString(),
      updateName: user?.user_name || user?.name,
    });
    await this.repo.save(item);

    if (dto.availableScenaryIds !== undefined) {
      await this.repo.query('DELETE FROM tab_campeonato_edition_scenaries WHERE edition_id = $1', [numId]);
      if (Array.isArray(dto.availableScenaryIds)) {
        for (const scId of dto.availableScenaryIds) {
          if (scId) {
            await this.repo.query('INSERT INTO tab_campeonato_edition_scenaries (edition_id, scenary_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [numId, scId]);
          }
        }
      }
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
            maxPlayers: Number(det.maxPlayers) > 0 ? Number(det.maxPlayers) : 25,
            matchDurationMinutes: det.matchDurationMinutes !== undefined && det.matchDurationMinutes !== null ? Number(det.matchDurationMinutes) : 60,
            breakDurationMinutes: det.breakDurationMinutes !== undefined && det.breakDurationMinutes !== null ? Number(det.breakDurationMinutes) : 10,
            waitBetweenMatchesMinutes: det.waitBetweenMatchesMinutes !== undefined && det.waitBetweenMatchesMinutes !== null ? Number(det.waitBetweenMatchesMinutes) : 10,
            stages: Array.isArray(det.stages) ? det.stages : [],
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

    return this.get(numId);
  }

  async remove(id: string | number) {
    const numId = Number(id);
    const item = await this.get(numId);
    const oldDetails = await this.detailRepo.find({ where: { editionId: numId } });
    for (const od of oldDetails) {
      await this.classificationRepo.delete({ categoryDetailId: od.id });
    }
    await this.detailRepo.delete({ editionId: numId });
    return this.repo.remove(item);
  }
}
