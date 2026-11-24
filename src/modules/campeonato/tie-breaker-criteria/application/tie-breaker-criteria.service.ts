import { Injectable, NotFoundException, BadRequestException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TieBreakerCriterionOrmEntity } from '../../infrastructure/persistence/tie-breaker-criterion.orm-entity';
import { CreateTieBreakerCriterionDto, UpdateTieBreakerCriterionDto } from './dto/tie-breaker-criterion.dto';

@Injectable()
export class TieBreakerCriteriaService implements OnModuleInit {
  constructor(
    @InjectRepository(TieBreakerCriterionOrmEntity)
    private readonly repo: Repository<TieBreakerCriterionOrmEntity>,
  ) {}

  async onModuleInit() {
    const count = await this.repo.count();
    if (count === 0) {
      const defaults = [
        { code: 'GOL_DIF', description: 'Gol Diferencia (GD)', observation: 'Diferencia entre goles a favor y goles en contra' },
        { code: 'GOLES_FAVOR', description: 'Mayor Número de Goles a Favor (GF)', observation: 'Mayor cantidad de goles anotados' },
        { code: 'RESULTADO_DIRECTO', description: 'Resultado Particular / Enfrentamiento Directo', observation: 'Resultado del cotejo disputado entre los clubes empatados' },
        { code: 'MENOS_GOLES_CONTRA', description: 'Menor Número de Goles en Contra (GC)', observation: 'Valla menos batida' },
        { code: 'FAIR_PLAY', description: 'Juego Limpio / Fair Play (Menor Puntaje Disciplinario)', observation: 'Menor acumulación de tarjetas rojas y amarillas' },
        { code: 'PENALES', description: 'Definición por Tiros Penales', observation: 'Tanda reglamentaria de penales al término del partido' },
        { code: 'SORTEO', description: 'Sorteo Reglamentario', observation: 'Sorteo en sesión oficial de la comisión o gremio arbitral' },
      ];
      for (const item of defaults) {
        await this.repo.save(this.repo.create({ ...item, isActive: true }));
      }
    }
  }

  async list(companyId: number, query: { page?: number; limit?: number; search?: string; status?: string; description?: string; code?: string }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const qb = this.repo.createQueryBuilder('tbc');
    if (query.status === 'true' || query.status === 'false') {
      qb.andWhere('tbc.isActive = :isActive', { isActive: query.status === 'true' });
    }
    if (query.description?.trim()) {
      qb.andWhere('LOWER(tbc.description) LIKE :desc', { desc: `%${query.description.trim().toLowerCase()}%` });
    }
    if (query.code?.trim()) {
      qb.andWhere('LOWER(tbc.code) LIKE :code', { code: `%${query.code.trim().toLowerCase()}%` });
    }
    if (query.search?.trim()) {
      qb.andWhere('(LOWER(tbc.description) LIKE :term OR LOWER(tbc.code) LIKE :term OR LOWER(tbc.observation) LIKE :term)', {
        term: `%${query.search.trim().toLowerCase()}%`,
      });
    }

    qb.orderBy('tbc.description', 'ASC').skip(skip).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async get(id: string | number) {
    const item = await this.repo.findOne({ where: { id: Number(id) } });
    if (!item) throw new NotFoundException('Criterio de desempate no encontrado');
    return item;
  }

  async create(dto: CreateTieBreakerCriterionDto, user: any, companyId?: number) {
    const cleanDesc = dto.description.trim();
    const existing = await this.repo.createQueryBuilder('tbc')
      .where('LOWER(tbc.description) = LOWER(:desc)', { desc: cleanDesc })
      .getOne();

    if (existing) {
      throw new BadRequestException(`Ya existe un criterio de desempate con la descripción "${cleanDesc}".`);
    }

    const item = this.repo.create({
      ...dto,
      description: cleanDesc,
      code: dto.code ? dto.code.trim().toUpperCase() : undefined,
      observation: dto.observation?.trim() || undefined,
      isActive: dto.isActive !== undefined ? dto.isActive : true,
      companyId: undefined,
      createdBy: user?.user_id?.toString() || user?.id?.toString(),
      createdName: user?.user_name || user?.name,
    });
    return this.repo.save(item);
  }

  async update(id: string | number, dto: UpdateTieBreakerCriterionDto, user: any) {
    const item = await this.get(id);

    if (dto.description && dto.description.trim() !== item.description) {
      const existing = await this.repo.findOne({
        where: { description: dto.description.trim() },
      });
      if (existing && existing.id !== Number(id)) {
        throw new BadRequestException(`Ya existe otro criterio de desempate con la descripción "${dto.description}".`);
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

  async remove(id: string | number) {
    const item = await this.get(id);
    return this.repo.remove(item);
  }
}
