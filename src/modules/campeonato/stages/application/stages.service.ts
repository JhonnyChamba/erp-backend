import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoryEditionOrmEntity } from '../../infrastructure/persistence/category-edition.orm-entity';
import { CategoryOrmEntity } from '../../infrastructure/persistence/category.orm-entity';
import { assertBelongsToCompany, ensureCompanyScope } from '../../common/company-scope.util';
import { StageOrmEntity } from '../../infrastructure/persistence/stage.orm-entity';
import { StagePlayerClassificationOrmEntity } from '../../infrastructure/persistence/stage-player-classification.orm-entity';
import { PlayerRegistrationOrmEntity } from '../../infrastructure/persistence/player-registration.orm-entity';
import { PlayerClassificationOrmEntity } from '../../infrastructure/persistence/player-classification.orm-entity';
import {
  CreateStageDto,
  UpdateStageDto,
  CreateStagePlayerClassificationDto,
  UpdateStagePlayerClassificationDto,
} from './dto/stage.dto';

@Injectable()
export class StagesService {
  constructor(
    @InjectRepository(StageOrmEntity)
    private readonly repo: Repository<StageOrmEntity>,
    @InjectRepository(StagePlayerClassificationOrmEntity)
    private readonly stageClassificationRepo: Repository<StagePlayerClassificationOrmEntity>,
    @InjectRepository(PlayerRegistrationOrmEntity)
    private readonly playerRegistrationRepo: Repository<PlayerRegistrationOrmEntity>,
    @InjectRepository(PlayerClassificationOrmEntity)
    private readonly playerClassificationRepo: Repository<PlayerClassificationOrmEntity>,
  ) {}

  async list(companyId: number, query: { page?: number; limit?: number; search?: string }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const qb = this.repo
      .createQueryBuilder('s')
      .leftJoinAndSelect('s.categoryEdition', 'categoryEdition')
      .leftJoinAndSelect('s.category', 'category')
      .leftJoinAndSelect('s.previousStage', 'previousStage');
    if (companyId) {
      qb.andWhere('(s.companyId = :companyId OR s.companyId IS NULL)', { companyId });
    }
    if (query.search?.trim()) {
      qb.andWhere('(LOWER(s.name) LIKE :term OR LOWER(categoryEdition.name) LIKE :term OR LOWER(COALESCE(category.name, \'\')) LIKE :term)', {
        term: `%${query.search.trim().toLowerCase()}%`,
      });
    }

    qb.orderBy('s.stageOrder', 'ASC').addOrderBy('s.createdAt', 'DESC').skip(skip).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async get(id: string | number, companyId: number, write = false) {
    const item = await this.repo.findOne({ where: { id: Number(id) }, relations: ['categoryEdition'] });
    return ensureCompanyScope(item, companyId, 'Etapa no encontrada', write);
  }

  /** Los ids recibidos en el body deben pertenecer a la empresa activa. */
  private async assertReferences(dto: CreateStageDto | UpdateStageDto, companyId: number) {
    await assertBelongsToCompany(this.repo.manager.getRepository(CategoryEditionOrmEntity), dto.categoryEditionId, companyId, 'Edición de torneo no encontrada');
    await assertBelongsToCompany(this.repo.manager.getRepository(CategoryOrmEntity), dto.categoryId, companyId, 'Categoría no encontrada');
    await assertBelongsToCompany(this.repo, dto.previousStageId, companyId, 'Etapa previa no encontrada');
  }

  async create(dto: CreateStageDto, user: any, companyId: number) {
    await this.assertReferences(dto, companyId);
    if (dto.maxPlayersPerTeam !== undefined && dto.maxPlayersPerTeam !== null && dto.maxPlayersPerTeam <= 0) {
      throw new BadRequestException('El límite máximo de futbolistas por equipo debe ser un valor positivo mayor a 0.');
    }

    const item = this.repo.create({
      ...dto,
      companyId,
      createdBy: user?.user_id?.toString() || user?.id?.toString(),
      createdName: user?.user_name || user?.name,
    });
    return this.repo.save(item);
  }

  async update(id: string | number, dto: UpdateStageDto, user: any, companyId: number) {
    const numId = Number(id);
    const item = await this.get(numId, companyId, true);
    await this.assertReferences(dto, companyId);

    if (dto.maxPlayersPerTeam !== undefined && dto.maxPlayersPerTeam !== null) {
      if (dto.maxPlayersPerTeam <= 0) {
        throw new BadRequestException('El límite máximo de futbolistas por equipo debe ser mayor a 0.');
      }

      // Regla 4: Validar que el nuevo límite no sea menor a la suma de clasificaciones ya configuradas
      const stageClassifications = await this.stageClassificationRepo.find({ where: { stageId: numId } });
      const currentSum = stageClassifications.reduce((acc, curr) => acc + curr.maxPlayers, 0);
      if (dto.maxPlayersPerTeam < currentSum) {
        throw new BadRequestException(
          `No se puede establecer el límite en ${dto.maxPlayersPerTeam} porque la suma de clasificaciones configuradas actualmente es de ${currentSum} cupos. Ajuste primero las clasificaciones.`,
        );
      }
    }

    Object.assign(item, dto, {
      updatedBy: user?.user_id?.toString() || user?.id?.toString(),
      updateName: user?.user_name || user?.name,
    });
    return this.repo.save(item);
  }

  async remove(id: string | number, companyId: number) {
    const item = await this.get(id, companyId, true);
    return this.repo.remove(item);
  }

  // ==============================================================
  // GESTIÓN DE CLASIFICACIONES DE FUTBOLISTAS POR ETAPA / FASE
  // ==============================================================

  async listClassifications(stageId: string | number, companyId: number) {
    const numStageId = Number(stageId);
    const stage = await this.get(numStageId, companyId);
    const classifications = await this.stageClassificationRepo.find({
      where: { stageId: numStageId },
      relations: ['playerClassification'],
      order: { createdAt: 'ASC' },
    });

    const totalDistributed = classifications.reduce((acc, curr) => acc + curr.maxPlayers, 0);
    const remainingSlots = (stage.maxPlayersPerTeam || 0) > 0 ? Math.max(0, stage.maxPlayersPerTeam - totalDistributed) : null;

    return {
      stageId: numStageId,
      stageName: stage.name,
      maxPlayersPerTeam: stage.maxPlayersPerTeam,
      totalDistributed,
      remainingSlots,
      data: classifications,
    };
  }

  async addClassification(stageId: string | number, dto: CreateStagePlayerClassificationDto, user: any, companyId: number) {
    const numStageId = Number(stageId);
    const stage = await this.get(numStageId, companyId, true);

    // Regla 2: Cantidades estrictamente positivas
    if (!dto.maxPlayers || dto.maxPlayers <= 0) {
      throw new BadRequestException('La cantidad máxima permitida por equipo debe ser un valor mayor a cero.');
    }

    // Validar existencia de la clasificación
    const classification = await this.playerClassificationRepo.findOne({
      where: { id: Number(dto.playerClassificationId) },
    });
    if (!classification) {
      throw new NotFoundException('La clasificación de futbolista seleccionada no existe.');
    }

    // Regla 3: No duplicar la misma clasificación en la etapa
    const existing = await this.stageClassificationRepo.findOne({
      where: { stageId: numStageId, playerClassificationId: Number(dto.playerClassificationId) },
    });
    if (existing) {
      throw new BadRequestException(`La clasificación "${classification.description}" ya está asignada a esta etapa.`);
    }

    // Regla 1: Suma de cantidades máximas no puede superar el límite de la etapa
    const currentList = await this.stageClassificationRepo.find({ where: { stageId: numStageId } });
    const currentSum = currentList.reduce((acc, curr) => acc + curr.maxPlayers, 0);
    const stageLimit = stage.maxPlayersPerTeam;

    if (stageLimit && stageLimit > 0 && currentSum + dto.maxPlayers > stageLimit) {
      const available = Math.max(0, stageLimit - currentSum);
      throw new BadRequestException(
        `Cupo excedido: La etapa permite un máximo de ${stageLimit} futbolistas por equipo. Actualmente se han asignado ${currentSum} cupos. Solo quedan ${available} cupos disponibles.`,
      );
    }

    const item = this.stageClassificationRepo.create({
      stageId: numStageId,
      playerClassificationId: Number(dto.playerClassificationId),
      maxPlayers: dto.maxPlayers,
      companyId,
      createdBy: user?.user_id?.toString() || user?.id?.toString(),
      createdName: user?.user_name || user?.name,
    });
    await this.stageClassificationRepo.save(item);

    return this.listClassifications(numStageId, companyId);
  }

  async updateClassification(id: string | number, dto: UpdateStagePlayerClassificationDto, user: any, companyId: number) {
    const numId = Number(id);
    const item = await this.stageClassificationRepo.findOne({
      where: { id: numId },
      relations: ['stage', 'playerClassification'],
    });
    if (!item) {
      throw new NotFoundException('Registro de clasificación en etapa no encontrado.');
    }
    ensureCompanyScope(item.stage, companyId, 'Registro de clasificación en etapa no encontrado.', true);

    if (dto.maxPlayers !== undefined) {
      if (dto.maxPlayers <= 0) {
        throw new BadRequestException('La cantidad máxima permitida debe ser mayor a cero.');
      }

      // Regla 1: Validar suma con el nuevo cupo
      const otherList = await this.stageClassificationRepo.find({
        where: { stageId: item.stageId },
      });
      const otherSum = otherList
        .filter((c) => c.id !== numId)
        .reduce((acc, curr) => acc + curr.maxPlayers, 0);

      const stageLimit = item.stage.maxPlayersPerTeam;
      if (stageLimit && stageLimit > 0 && otherSum + dto.maxPlayers > stageLimit) {
        const available = Math.max(0, stageLimit - otherSum);
        throw new BadRequestException(
          `La suma de cupos (${otherSum + dto.maxPlayers}) excede el límite de la etapa (${stageLimit}). Cupo máximo asignable: ${available}.`,
        );
      }

      // Regla de integridad: No permitir bajar el cupo por debajo de jugadores ya inscritos en algún equipo
      const registrations = await this.playerRegistrationRepo
        .createQueryBuilder('pr')
        .select('pr.teamRegistrationId', 'teamRegistrationId')
        .addSelect('COUNT(pr.id)', 'count')
        .where('pr.playerClassificationId = :pcId', { pcId: item.playerClassificationId })
        .andWhere('(pr.stageId = :stageId OR pr.stageId IS NULL)', { stageId: item.stageId })
        .groupBy('pr.teamRegistrationId')
        .getRawMany();

      for (const reg of registrations) {
        const currentCount = Number(reg.count || 0);
        if (currentCount > dto.maxPlayers) {
          throw new BadRequestException(
            `No se puede reducir el cupo a ${dto.maxPlayers} porque ya existen equipos con ${currentCount} futbolista(s) registrados bajo la clasificación "${item.playerClassification.description}".`,
          );
        }
      }

      item.maxPlayers = dto.maxPlayers;
    }

    item.updatedBy = user?.user_id?.toString() || user?.id?.toString();
    item.updateName = user?.user_name || user?.name;
    await this.stageClassificationRepo.save(item);

    return this.listClassifications(item.stageId, companyId);
  }

  async removeClassification(id: string | number, companyId: number) {
    const numId = Number(id);
    const item = await this.stageClassificationRepo.findOne({
      where: { id: numId },
      relations: ['stage', 'playerClassification'],
    });
    if (!item) {
      throw new NotFoundException('Registro de clasificación en etapa no encontrado.');
    }
    ensureCompanyScope(item.stage, companyId, 'Registro de clasificación en etapa no encontrado.', true);

    // Validar si existen jugadores inscritos con esta clasificación en esta etapa
    const count = await this.playerRegistrationRepo.count({
      where: {
        playerClassificationId: item.playerClassificationId,
        stageId: item.stageId,
      },
    });

    if (count > 0) {
      throw new BadRequestException(
        `No se puede quitar la clasificación "${item.playerClassification.description}" porque ya cuenta con ${count} futbolista(s) inscrito(s) en esta etapa.`,
      );
    }

    const stageId = item.stageId;
    await this.stageClassificationRepo.remove(item);
    return this.listClassifications(stageId, companyId);
  }
}
