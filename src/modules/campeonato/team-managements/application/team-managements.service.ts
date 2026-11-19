import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeamOrmEntity } from '../../infrastructure/persistence/team.orm-entity';
import { assertBelongsToCompany, ensureCompanyScope } from '../../common/company-scope.util';
import { TeamManagementOrmEntity } from '../../infrastructure/persistence/team-management.orm-entity';
import { CreateTeamManagementDto, UpdateTeamManagementDto } from './dto/team-management.dto';

@Injectable()
export class TeamManagementsService {
  constructor(
    @InjectRepository(TeamManagementOrmEntity)
    private readonly repo: Repository<TeamManagementOrmEntity>,
  ) {}

  async list(companyId: number, query: { page?: number; limit?: number; search?: string }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const qb = this.repo
      .createQueryBuilder('tm')
      .leftJoinAndSelect('tm.position', 'position')
      .leftJoinAndSelect('tm.team', 'team')
      .leftJoinAndSelect('tm.player', 'player');

    if (companyId) {
      qb.andWhere('(tm.companyId = :companyId OR tm.companyId IS NULL)', { companyId });
    }
    if (query.search?.trim()) {
      qb.andWhere('(LOWER(tm.name) LIKE :term OR LOWER(tm.lastName) LIKE :term OR LOWER(tm.identification) LIKE :term OR LOWER(team.name) LIKE :term OR LOWER(tm.roleTitle) LIKE :term)', {
        term: `%${query.search.trim().toLowerCase()}%`,
      });
    }

    qb.orderBy('tm.createdAt', 'DESC').skip(skip).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async listByTeam(teamId: string | number, companyId: number) {
    await assertBelongsToCompany(this.repo.manager.getRepository(TeamOrmEntity), teamId, companyId, 'Equipo no encontrado');
    return this.repo.find({
      where: { teamId: Number(teamId) },
      relations: ['position'],
      order: { createdAt: 'ASC' },
    });
  }

  async get(id: string | number, companyId: number, write = false) {
    const item = await this.repo.findOne({
      where: { id: Number(id) },
      relations: ['position', 'team', 'player'],
    });
    return ensureCompanyScope(item, companyId, 'Directivo de equipo no encontrado', write);
  }

  async create(dto: CreateTeamManagementDto, user: any, companyId: number) {
    await assertBelongsToCompany(this.repo.manager.getRepository(TeamOrmEntity), dto.teamId, companyId, 'Equipo no encontrado');
    const item = this.repo.create({
      ...dto,
      companyId,
      createdBy: user?.user_id?.toString() || user?.id?.toString(),
      createdName: user?.user_name || user?.name,
    });
    return this.repo.save(item);
  }

  async update(id: string | number, dto: UpdateTeamManagementDto, user: any, companyId: number) {
    const item = await this.get(id, companyId, true);
    await assertBelongsToCompany(this.repo.manager.getRepository(TeamOrmEntity), dto.teamId, companyId, 'Equipo no encontrado');
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
}
