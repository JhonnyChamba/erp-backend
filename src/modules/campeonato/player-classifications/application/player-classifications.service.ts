import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlayerClassificationOrmEntity } from '../../infrastructure/persistence/player-classification.orm-entity';
import { StagePlayerClassificationOrmEntity } from '../../infrastructure/persistence/stage-player-classification.orm-entity';
import { PlayerRegistrationOrmEntity } from '../../infrastructure/persistence/player-registration.orm-entity';
import { PlayerOrmEntity } from '../../infrastructure/persistence/player.orm-entity';
import { CreatePlayerClassificationDto, UpdatePlayerClassificationDto } from './dto/player-classification.dto';

@Injectable()
export class PlayerClassificationsService {
  constructor(
    @InjectRepository(PlayerClassificationOrmEntity)
    private readonly repo: Repository<PlayerClassificationOrmEntity>,
    @InjectRepository(StagePlayerClassificationOrmEntity)
    private readonly stageClassificationRepo: Repository<StagePlayerClassificationOrmEntity>,
    @InjectRepository(PlayerRegistrationOrmEntity)
    private readonly playerRegistrationRepo: Repository<PlayerRegistrationOrmEntity>,
    @InjectRepository(PlayerOrmEntity)
    private readonly playerRepo: Repository<PlayerOrmEntity>,
  ) {}

  async list(companyId: number, query: { page?: number; limit?: number; search?: string }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const qb = this.repo.createQueryBuilder('pc');
    // Catálogo global: no se filtra restrictivamente por empresa
    if (query.search?.trim()) {
      qb.andWhere('(LOWER(pc.description) LIKE :term OR LOWER(pc.code) LIKE :term OR LOWER(pc.observation) LIKE :term)', {
        term: `%${query.search.trim().toLowerCase()}%`,
      });
    }

    qb.orderBy('pc.description', 'ASC').skip(skip).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async get(id: string) {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Clasificación de futbolista no encontrada');
    return item;
  }

  async create(dto: CreatePlayerClassificationDto, user: any, companyId?: number) {
    const cleanDesc = dto.description.trim();
    // Validar descripción global no duplicada
    const existing = await this.repo.createQueryBuilder('pc')
      .where('LOWER(pc.description) = LOWER(:desc)', { desc: cleanDesc })
      .getOne();

    if (existing) {
      throw new BadRequestException(`Ya existe una clasificación con la descripción "${cleanDesc}".`);
    }

    const item = this.repo.create({
      ...dto,
      description: cleanDesc,
      code: dto.code ? dto.code.trim().toUpperCase() : undefined,
      observation: dto.observation?.trim() || undefined,
      isActive: dto.isActive !== undefined ? dto.isActive : true,
      companyId: undefined, // Catálogo Global
      createdBy: user?.user_id?.toString() || user?.id?.toString(),
      createdName: user?.user_name || user?.name,
    });
    return this.repo.save(item);
  }

  async update(id: string, dto: UpdatePlayerClassificationDto, user: any) {
    const item = await this.get(id);

    if (dto.description && dto.description.trim() !== item.description) {
      const existing = await this.repo.findOne({
        where: {
          description: dto.description.trim(),
          companyId: item.companyId || undefined,
        },
      });
      if (existing && existing.id !== id) {
        throw new BadRequestException(`Ya existe otra clasificación con la descripción "${dto.description}".`);
      }
    }

    Object.assign(item, dto, {
      description: dto.description ? dto.description.trim() : item.description,
      code: dto.code !== undefined ? (dto.code ? dto.code.trim().toUpperCase() : null) : item.code,
      updatedBy: user?.user_id?.toString() || user?.id?.toString(),
      updateName: user?.user_name || user?.name,
    });
    return this.repo.save(item);
  }

  async remove(id: string) {
    const item = await this.get(id);

    // 1. Validar si está asignada en etapas
    const countInStages = await this.stageClassificationRepo.count({
      where: { playerClassificationId: id },
    });
    if (countInStages > 0) {
      throw new BadRequestException(
        `No se puede eliminar la clasificación "${item.description}" porque está configurada en ${countInStages} etapa(s) de competición.`,
      );
    }

    // 2. Validar si está asignada en inscripciones de jugadores
    const countInRegistrations = await this.playerRegistrationRepo.count({
      where: { playerClassificationId: id },
    });
    if (countInRegistrations > 0) {
      throw new BadRequestException(
        `No se puede eliminar la clasificación "${item.description}" porque se encuentra asignada a ${countInRegistrations} inscripción(es) de futbolistas.`,
      );
    }

    // 3. Validar si está asignada en fichas de jugadores
    const countInPlayers = await this.playerRepo.count({
      where: { playerClassificationId: id },
    });
    if (countInPlayers > 0) {
      throw new BadRequestException(
        `No se puede eliminar la clasificación "${item.description}" porque está vinculada a la ficha de ${countInPlayers} jugador(es).`,
      );
    }

    return this.repo.remove(item);
  }
}
