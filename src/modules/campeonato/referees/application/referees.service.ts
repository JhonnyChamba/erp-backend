import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefereeOrmEntity } from '../../infrastructure/persistence/referee.orm-entity';
import { CompanyRefereeOrmEntity } from '../../infrastructure/persistence/company-referee.orm-entity';
import { CreateRefereeDto, UpdateRefereeDto } from './dto/referee.dto';

@Injectable()
export class RefereesService {
  constructor(
    @InjectRepository(RefereeOrmEntity)
    private readonly repo: Repository<RefereeOrmEntity>,
    @InjectRepository(CompanyRefereeOrmEntity)
    private readonly companyRefereeRepo: Repository<CompanyRefereeOrmEntity>,
  ) {}

  /**
   * Consulta si un árbitro existe en el padrón global por su identificación (cédula/DNI)
   * y si ya está vinculado a la empresa/liga solicitante.
   */
  async findGlobalByIdentification(identification: string, companyId?: number) {
    const cleanId = (identification || '').trim();
    if (!cleanId) {
      return { exists: false, referee: null, isLinkedToCurrentCompany: false };
    }

    const referee = await this.repo.findOne({
      where: { identification: cleanId },
      relations: ['guild'],
    });

    if (!referee) {
      return { exists: false, referee: null, isLinkedToCurrentCompany: false };
    }

    let isLinkedToCurrentCompany = false;
    if (companyId) {
      const link = await this.companyRefereeRepo.findOne({
        where: { refereeId: referee.id, companyId },
      });
      isLinkedToCurrentCompany = !!link;
    }

    return {
      exists: true,
      referee,
      isLinkedToCurrentCompany,
    };
  }

  /**
   * Lista árbitros:
   * Si query.global === 'true' o no hay companyId, lista de tab_campeonato_referees (padrón global).
   * Si hay companyId (por defecto), lista los árbitros asociados a esa empresa mediante tab_campeonato_company_referees.
   */
  async list(companyId: number, query: { page?: number; limit?: number; search?: string; global?: string; status?: string; identification?: string; name?: string; lastName?: string }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));
    const skip = (page - 1) * limit;
    const isGlobal = query.global === 'true' || !companyId;

    if (isGlobal) {
      const qb = this.repo.createQueryBuilder('r')
        .leftJoinAndSelect('r.guild', 'guild');

      if (query.status === 'true' || query.status === 'false') {
        qb.andWhere('r.isActive = :isActive', { isActive: query.status === 'true' });
      }
      if (query.identification?.trim()) {
        qb.andWhere('LOWER(r.identification) LIKE :ident', { ident: `%${query.identification.trim().toLowerCase()}%` });
      }
      if (query.name?.trim()) {
        qb.andWhere('LOWER(r.name) LIKE :fname', { fname: `%${query.name.trim().toLowerCase()}%` });
      }
      if (query.lastName?.trim()) {
        qb.andWhere('LOWER(r.lastName) LIKE :flast', { flast: `%${query.lastName.trim().toLowerCase()}%` });
      }

      if (query.search?.trim()) {
        qb.andWhere('(LOWER(r.name) LIKE :term OR LOWER(r.lastName) LIKE :term OR LOWER(r.identification) LIKE :term)', {
          term: `%${query.search.trim().toLowerCase()}%`,
        });
      }

      qb.orderBy('r.createdAt', 'DESC').skip(skip).take(limit);
      const [data, total] = await qb.getManyAndCount();
      return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }

    // Listado por empresa mediante tab_campeonato_company_referees
    const qb = this.companyRefereeRepo.createQueryBuilder('cr')
      .innerJoinAndSelect('cr.referee', 'r')
      .leftJoinAndSelect('r.guild', 'guild')
      .where('cr.companyId = :companyId', { companyId });

    if (query.status === 'true' || query.status === 'false') {
      qb.andWhere('cr.isActive = :isActive', { isActive: query.status === 'true' });
    }
    if (query.identification?.trim()) {
      qb.andWhere('LOWER(r.identification) LIKE :ident', { ident: `%${query.identification.trim().toLowerCase()}%` });
    }
    if (query.name?.trim()) {
      qb.andWhere('LOWER(r.name) LIKE :fname', { fname: `%${query.name.trim().toLowerCase()}%` });
    }
    if (query.lastName?.trim()) {
      qb.andWhere('LOWER(r.lastName) LIKE :flast', { flast: `%${query.lastName.trim().toLowerCase()}%` });
    }

    if (query.search?.trim()) {
      qb.andWhere('(LOWER(r.name) LIKE :term OR LOWER(r.lastName) LIKE :term OR LOWER(r.identification) LIKE :term)', {
        term: `%${query.search.trim().toLowerCase()}%`,
      });
    }

    qb.orderBy('cr.createdAt', 'DESC').skip(skip).take(limit);
    const [links, total] = await qb.getManyAndCount();

    const data = links.map((link) => ({
      ...link.referee,
      companyRefereeId: link.id,
      isActiveInCompany: link.isActive,
    }));

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  /**
   * El árbitro pertenece a un padrón global: por :id solo lo ve/edita una empresa que lo tenga vinculado
   * (tab_campeonato_company_referees) o que lo haya registrado. Un super admin administra el padrón completo.
   */
  async get(id: string | number, companyId: number, user?: any) {
    const item = await this.repo.findOne({ where: { id: Number(id) }, relations: ['guild'] });
    if (!item) throw new NotFoundException('Árbitro no encontrado');
    const isSuperAdmin = Boolean(user?.super_admin || user?.developer);
    if (!isSuperAdmin && Number(item.companyId) !== Number(companyId)) {
      const link = await this.companyRefereeRepo.findOne({ where: { refereeId: item.id, companyId } });
      if (!link) throw new NotFoundException('Árbitro no encontrado');
    }
    return item;
  }

  /**
   * Crea o vincula un árbitro:
   * 1. Si ya existe en tab_campeonato_referees por identification:
   *    - Actualiza sus datos opcionales.
   *    - Lo vincula a tab_campeonato_company_referees si no está vinculado.
   * 2. Si no existe:
   *    - Lo crea en tab_campeonato_referees (con isActive: true por defecto).
   *    - Si hay companyId, lo vincula a tab_campeonato_company_referees.
   */
  async create(dto: CreateRefereeDto, user: any, companyId: number) {
    const cleanId = (dto.identification || '').trim();
    let referee = cleanId ? await this.repo.findOne({ where: { identification: cleanId } }) : null;

    if (referee) {
      // Actualizar datos si cambiaron
      if (dto.name) referee.name = dto.name.trim();
      if (dto.lastName) referee.lastName = dto.lastName.trim();
      if (dto.guildId !== undefined) referee.guildId = dto.guildId;
      if (dto.phone !== undefined) referee.phone = dto.phone?.trim() || null;
      if (dto.email !== undefined) referee.email = dto.email?.trim() || null;
      referee.updatedBy = user?.user_id?.toString() || user?.id?.toString();
      referee.updateName = user?.user_name || user?.name;
      referee = await this.repo.save(referee);
    } else {
      referee = this.repo.create({
        ...dto,
        identification: cleanId,
        name: dto.name.trim(),
        lastName: dto.lastName.trim(),
        guildId: dto.guildId || undefined,
        isActive: true, // Por defecto siempre activo
        companyId: companyId || undefined,
        createdBy: user?.user_id?.toString() || user?.id?.toString(),
        createdName: user?.user_name || user?.name,
      });
      referee = await this.repo.save(referee);
    }

    // Vincular a la empresa actual si no está vinculado
    if (companyId) {
      const existingLink = await this.companyRefereeRepo.findOne({
        where: { refereeId: referee.id, companyId },
      });
      if (!existingLink) {
        const link = this.companyRefereeRepo.create({
          companyId,
          refereeId: referee.id,
          isActive: true,
        });
        await this.companyRefereeRepo.save(link);
      }
    }

    return this.get(referee.id, companyId);
  }

  async update(id: string | number, dto: UpdateRefereeDto, user: any, companyId: number) {
    const item = await this.get(id, companyId, user);
    if (dto.name !== undefined) item.name = dto.name.trim();
    if (dto.lastName !== undefined) item.lastName = dto.lastName.trim();
    if (dto.identification !== undefined) item.identification = dto.identification.trim();
    if (dto.guildId !== undefined) item.guildId = dto.guildId ? Number(dto.guildId) : null;
    if (dto.phone !== undefined) item.phone = dto.phone?.trim() || null;
    if (dto.email !== undefined) item.email = dto.email?.trim() || null;
    if (dto.category !== undefined) item.category = dto.category?.trim() || null;
    if (dto.isActive !== undefined) item.isActive = dto.isActive;

    item.updatedBy = user?.user_id?.toString() || user?.id?.toString();
    item.updateName = user?.user_name || user?.name;
    return this.repo.save(item);
  }

  /**
   * Elimina o desvincula:
   * Si se provee companyId y existe en tab_campeonato_company_referees, desvincula de la liga.
   * Si query.global === 'true', elimina el árbitro del padrón global.
   */
  async remove(id: string | number, companyId: number, isGlobal = false, user?: any) {
    if (!isGlobal) {
      // Una empresa solo puede desvincular al árbitro de su liga; nunca borrarlo del padrón global.
      const link = await this.companyRefereeRepo.findOne({
        where: { refereeId: Number(id), companyId },
      });
      if (!link) throw new NotFoundException('Árbitro no encontrado en esta liga');
      await this.companyRefereeRepo.remove(link);
      return { success: true, message: 'Árbitro desvinculado de la liga correctamente' };
    }

    if (!user?.super_admin && !user?.developer) {
      throw new ForbiddenException('Solo un super administrador puede eliminar árbitros del padrón global.');
    }
    const item = await this.repo.findOne({ where: { id: Number(id) } });
    if (!item) throw new NotFoundException('Árbitro no encontrado');
    await this.repo.remove(item);
    return { success: true, message: 'Árbitro eliminado del padrón global' };
  }
}
