import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StageTemplateOrmEntity } from '../../infrastructure/persistence/stage-template.orm-entity';
import { StageTemplateDetailOrmEntity } from '../../infrastructure/persistence/stage-template-detail.orm-entity';
import { CreateStageTemplateDto, UpdateStageTemplateDto } from './dto/stage-template.dto';

@Injectable()
export class StageTemplatesService {
  constructor(
    @InjectRepository(StageTemplateOrmEntity)
    private readonly repo: Repository<StageTemplateOrmEntity>,
    @InjectRepository(StageTemplateDetailOrmEntity)
    private readonly detailRepo: Repository<StageTemplateDetailOrmEntity>,
  ) {}

  async list(companyId: number, query: { page?: number; limit?: number; search?: string }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const qb = this.repo.createQueryBuilder('st')
      .leftJoinAndSelect('st.details', 'det')
      .leftJoinAndSelect('det.competitionType', 'ct')
      .leftJoinAndSelect('det.competitionLap', 'cl')
      .leftJoinAndSelect('det.tieBreakerCriterion', 'tb');

    if (companyId) {
      qb.andWhere('(st.companyId = :companyId OR st.companyId IS NULL)', { companyId });
    }

    if (query.search?.trim()) {
      qb.andWhere('(LOWER(st.name) LIKE :term OR LOWER(st.description) LIKE :term)', {
        term: `%${query.search.trim().toLowerCase()}%`,
      });
    }

    qb.orderBy('st.createdAt', 'DESC')
      .addOrderBy('det.stageOrder', 'ASC')
      .skip(skip)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async get(id: string, companyId?: number) {
    const qb = this.repo.createQueryBuilder('st')
      .leftJoinAndSelect('st.details', 'det')
      .leftJoinAndSelect('det.competitionType', 'ct')
      .leftJoinAndSelect('det.competitionLap', 'cl')
      .leftJoinAndSelect('det.tieBreakerCriterion', 'tb')
      .where('st.id = :id', { id });

    if (companyId) {
      qb.andWhere('(st.companyId = :companyId OR st.companyId IS NULL)', { companyId });
    }

    qb.orderBy('det.stageOrder', 'ASC');

    const item = await qb.getOne();
    if (!item) throw new NotFoundException('Plantilla de etapas y fases no encontrada');
    return item;
  }

  async create(dto: CreateStageTemplateDto, user: any, companyId?: number) {
    const cleanName = dto.name.trim();
    if (!cleanName) {
      throw new BadRequestException('El nombre de la plantilla es obligatorio');
    }

    const template = this.repo.create({
      companyId: companyId || null,
      name: cleanName,
      description: dto.description?.trim() || null,
      isActive: dto.isActive !== undefined ? dto.isActive : true,
      createdName: user?.username || user?.email || 'Sistema',
      createdBy: user?.id ? String(user.id) : user?.sub ? String(user.sub) : null,
    });

    const savedTemplate = await this.repo.save(template);

    if (dto.details && dto.details.length > 0) {
      const detailsToSave = dto.details.map((d, index) => {
        return this.detailRepo.create({
          stageTemplateId: savedTemplate.id,
          stageOrder: Number(d.stageOrder) || index + 1,
          name: d.name.trim(),
          competitionTypeId: d.competitionTypeId || null,
          competitionLapId: d.competitionLapId || null,
          tieBreakerCriterionId: d.tieBreakerCriterionId || null,
        });
      });
      await this.detailRepo.save(detailsToSave);
    }

    return this.get(savedTemplate.id, companyId);
  }

  async update(id: string, dto: UpdateStageTemplateDto, user: any, companyId?: number) {
    const template = await this.get(id, companyId);

    if (dto.name !== undefined) {
      const cleanName = dto.name.trim();
      if (!cleanName) throw new BadRequestException('El nombre no puede estar vacío');
      template.name = cleanName;
    }
    if (dto.description !== undefined) {
      template.description = dto.description?.trim() || null;
    }
    if (dto.isActive !== undefined) {
      template.isActive = dto.isActive;
    }

    template.updateName = user?.username || user?.email || 'Sistema';
    template.updatedBy = user?.id ? String(user.id) : user?.sub ? String(user.sub) : null;

    await this.repo.save(template);

    if (dto.details !== undefined) {
      // Reemplazar detalles anteriores
      await this.detailRepo.delete({ stageTemplateId: id });
      if (dto.details && dto.details.length > 0) {
        const detailsToSave = dto.details.map((d, index) => {
          return this.detailRepo.create({
            stageTemplateId: id,
            stageOrder: Number(d.stageOrder) || index + 1,
            name: d.name.trim(),
            competitionTypeId: d.competitionTypeId || null,
            competitionLapId: d.competitionLapId || null,
            tieBreakerCriterionId: d.tieBreakerCriterionId || null,
          });
        });
        await this.detailRepo.save(detailsToSave);
      }
    }

    return this.get(id, companyId);
  }

  async remove(id: string, companyId?: number) {
    const template = await this.get(id, companyId);
    await this.detailRepo.delete({ stageTemplateId: id });
    await this.repo.remove(template);
    return { success: true, message: 'Plantilla de etapas y fases eliminada con éxito' };
  }
}
