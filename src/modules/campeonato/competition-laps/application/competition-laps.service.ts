import { Injectable, NotFoundException, BadRequestException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompetitionLapOrmEntity } from '../../infrastructure/persistence/competition-lap.orm-entity';
import { CreateCompetitionLapDto, UpdateCompetitionLapDto } from './dto/competition-lap.dto';

@Injectable()
export class CompetitionLapsService implements OnModuleInit {
  constructor(
    @InjectRepository(CompetitionLapOrmEntity)
    private readonly repo: Repository<CompetitionLapOrmEntity>,
  ) {}

  async onModuleInit() {
    const count = await this.repo.count();
    if (count === 0) {
      const defaults = [
        { code: '1_VUELTA', description: 'Solo Ida (1 Vuelta)', numberOfLaps: 1, observation: 'Una sola rueda de partidos' },
        { code: '2_VUELTAS', description: 'Ida y Vuelta (2 Vueltas)', numberOfLaps: 2, observation: 'Partidos de ida y revancha de vuelta' },
        { code: '3_VUELTAS', description: '3 Vueltas (Ida, Vuelta y Neutral)', numberOfLaps: 3, observation: 'Tres ruedas completas de enfrentamientos' },
        { code: '4_VUELTAS', description: '4 Vueltas', numberOfLaps: 4, observation: 'Cuatro ruedas completas' },
      ];
      for (const item of defaults) {
        await this.repo.save(this.repo.create({ ...item, isActive: true }));
      }
    }
  }

  async list(companyId: number, query: { page?: number; limit?: number; search?: string }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const qb = this.repo.createQueryBuilder('cl');
    if (query.search?.trim()) {
      qb.andWhere('(LOWER(cl.description) LIKE :term OR LOWER(cl.code) LIKE :term OR LOWER(cl.observation) LIKE :term)', {
        term: `%${query.search.trim().toLowerCase()}%`,
      });
    }

    qb.orderBy('cl.numberOfLaps', 'ASC').addOrderBy('cl.description', 'ASC').skip(skip).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async get(id: string | number) {
    const item = await this.repo.findOne({ where: { id: Number(id) } });
    if (!item) throw new NotFoundException('Modalidad de vueltas no encontrada');
    return item;
  }

  async create(dto: CreateCompetitionLapDto, user: any, companyId?: number) {
    const cleanDesc = dto.description.trim();
    const existing = await this.repo.createQueryBuilder('cl')
      .where('LOWER(cl.description) = LOWER(:desc)', { desc: cleanDesc })
      .getOne();

    if (existing) {
      throw new BadRequestException(`Ya existe una modalidad de vueltas con la descripción "${cleanDesc}".`);
    }

    const item = this.repo.create({
      ...dto,
      description: cleanDesc,
      code: dto.code ? dto.code.trim().toUpperCase() : undefined,
      numberOfLaps: Number(dto.numberOfLaps) > 0 ? Number(dto.numberOfLaps) : 1,
      observation: dto.observation?.trim() || undefined,
      isActive: dto.isActive !== undefined ? dto.isActive : true,
      companyId: undefined,
      createdBy: user?.user_id?.toString() || user?.id?.toString(),
      createdName: user?.user_name || user?.name,
    });
    return this.repo.save(item);
  }

  async update(id: string | number, dto: UpdateCompetitionLapDto, user: any) {
    const item = await this.get(id);

    if (dto.description && dto.description.trim() !== item.description) {
      const existing = await this.repo.findOne({
        where: { description: dto.description.trim() },
      });
      if (existing && existing.id !== Number(id)) {
        throw new BadRequestException(`Ya existe otra modalidad de vueltas con la descripción "${dto.description}".`);
      }
    }

    Object.assign(item, dto, {
      description: dto.description ? dto.description.trim() : item.description,
      code: dto.code !== undefined ? (dto.code ? dto.code.trim().toUpperCase() : null) : item.code,
      numberOfLaps: dto.numberOfLaps !== undefined ? Number(dto.numberOfLaps) : item.numberOfLaps,
      updatedBy: user?.user_id?.toString() || user?.id?.toString(),
      updateName: user?.user_name || user?.name,
    });
    return this.repo.save(item);
  }

  async remove(id: string | number) {
    const item = await this.get(id);
    return this.repo.remove(item);
  }
}
