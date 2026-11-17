import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeamCategoryHistoryOrmEntity } from '../../infrastructure/persistence/team-category-history.orm-entity';
import { TeamOrmEntity } from '../../infrastructure/persistence/team.orm-entity';
import { CreateTeamCategoryHistoryDto } from './dto/team-category-history.dto';

@Injectable()
export class TeamCategoryHistoryService {
  constructor(
    @InjectRepository(TeamCategoryHistoryOrmEntity)
    private readonly repo: Repository<TeamCategoryHistoryOrmEntity>,
    @InjectRepository(TeamOrmEntity)
    private readonly teamRepo: Repository<TeamOrmEntity>,
  ) {}

  async listByTeam(teamId: string, companyId: number) {
    const qb = this.repo
      .createQueryBuilder('tch')
      .leftJoinAndSelect('tch.team', 'team')
      .leftJoinAndSelect('tch.category', 'category')
      .where('tch.teamId = :teamId', { teamId });

    if (companyId) {
      qb.andWhere('(tch.companyId = :companyId OR tch.companyId IS NULL)', { companyId });
    }

    qb.orderBy('tch.seasonYear', 'DESC').addOrderBy('tch.createdAt', 'DESC');
    return qb.getMany();
  }

  async create(dto: CreateTeamCategoryHistoryDto, user: any, companyId: number) {
    const record = this.repo.create({
      ...dto,
      companyId,
      assignedDate: dto.assignedDate ? new Date(dto.assignedDate) : new Date(),
      createdBy: user?.user_id?.toString() || user?.id?.toString(),
      createdName: user?.user_name || user?.name,
    });
    const saved = await this.repo.save(record);

    // Actualizar categoría actual en el equipo
    if (dto.teamId && dto.categoryId) {
      await this.teamRepo.update(dto.teamId, {
        currentCategoryId: dto.categoryId,
        currentSeasonYear: dto.seasonYear || '2026',
      });
    }

    return saved;
  }

  async remove(id: string) {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Registro de historial no encontrado');
    return this.repo.remove(item);
  }
}
