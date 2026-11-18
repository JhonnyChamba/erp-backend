import { Injectable, NotFoundException, BadRequestException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompetitionTypeOrmEntity } from '../../infrastructure/persistence/competition-type.orm-entity';
import { CreateCompetitionTypeDto, UpdateCompetitionTypeDto } from './dto/competition-type.dto';

@Injectable()
export class CompetitionTypesService implements OnModuleInit {
  constructor(
    @InjectRepository(CompetitionTypeOrmEntity)
    private readonly repo: Repository<CompetitionTypeOrmEntity>,
  ) {}

  async onModuleInit() {
    // Sembrar valores iniciales recomendados si la tabla está vacía
    const count = await this.repo.count();
    if (count === 0) {
      const defaults = [
        { code: 'TODOS_VS_TODOS', description: 'Todos contra Todos (Liga)', observation: 'Encuentros entre todos los equipos por puntos' },
        { code: 'PLAY_OFF', description: 'Eliminación Directa (Play-offs / Muerte Súbita)', observation: 'Llaves eliminatorias directas (Octavos, Cuartos, Semifinal, Final)' },
        { code: 'GRUPOS_PLAYOFF', description: 'Fase de Grupos + Clasificatoria a Play-offs', observation: 'Grupos iniciales seguidos de llaves de eliminación' },
        { code: 'CUADRANGULAR', description: 'Cuadrangular / Triangular Final', observation: 'Ronda final de puntos entre clasificados' },
        { code: 'SISTEMA_SUIZO', description: 'Sistema Suizo', observation: 'Emparejamiento de equipos con igual puntuación acumulada' },
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

    const qb = this.repo.createQueryBuilder('ct');
    if (query.search?.trim()) {
      qb.andWhere('(LOWER(ct.description) LIKE :term OR LOWER(ct.code) LIKE :term OR LOWER(ct.observation) LIKE :term)', {
        term: `%${query.search.trim().toLowerCase()}%`,
      });
    }

    qb.orderBy('ct.description', 'ASC').skip(skip).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async get(id: string) {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Tipo de competencia no encontrado');
    return item;
  }

  async create(dto: CreateCompetitionTypeDto, user: any, companyId?: number) {
    const cleanDesc = dto.description.trim();
    const existing = await this.repo.createQueryBuilder('ct')
      .where('LOWER(ct.description) = LOWER(:desc)', { desc: cleanDesc })
      .getOne();

    if (existing) {
      throw new BadRequestException(`Ya existe un tipo de competencia con la descripción "${cleanDesc}".`);
    }

    const item = this.repo.create({
      ...dto,
      description: cleanDesc,
      code: dto.code ? dto.code.trim().toUpperCase() : undefined,
      observation: dto.observation?.trim() || undefined,
      isActive: dto.isActive !== undefined ? dto.isActive : true,
      companyId: undefined, // Catálogo global
      createdBy: user?.user_id?.toString() || user?.id?.toString(),
      createdName: user?.user_name || user?.name,
    });
    return this.repo.save(item);
  }

  async update(id: string, dto: UpdateCompetitionTypeDto, user: any) {
    const item = await this.get(id);

    if (dto.description && dto.description.trim() !== item.description) {
      const existing = await this.repo.findOne({
        where: { description: dto.description.trim() },
      });
      if (existing && existing.id !== id) {
        throw new BadRequestException(`Ya existe otro tipo de competencia con la descripción "${dto.description}".`);
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
    return this.repo.remove(item);
  }
}
