import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TournamentCommitteeOrmEntity } from '../../infrastructure/persistence/tournament-committee.orm-entity';
import { CreateTournamentCommitteeDto, UpdateTournamentCommitteeDto } from './dto/tournament-committee.dto';

@Injectable()
export class TournamentCommitteesService {
  constructor(
    @InjectRepository(TournamentCommitteeOrmEntity)
    private readonly repo: Repository<TournamentCommitteeOrmEntity>,
  ) {}

  async list(companyId: number, query: { page?: number; limit?: number; search?: string }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const qb = this.repo.createQueryBuilder('tc').leftJoinAndSelect('tc.position', 'position');
    if (companyId) {
      qb.andWhere('(tc.companyId = :companyId OR tc.companyId IS NULL)', { companyId });
    }
    if (query.search?.trim()) {
      qb.andWhere('(LOWER(tc.name) LIKE :term OR LOWER(tc.lastName) LIKE :term OR LOWER(tc.identification) LIKE :term)', {
        term: `%${query.search.trim().toLowerCase()}%`,
      });
    }

    qb.orderBy('tc.createdAt', 'DESC').skip(skip).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async get(id: string | number) {
    const item = await this.repo.findOne({ where: { id: Number(id) }, relations: ['position'] });
    if (!item) throw new NotFoundException('Miembro de comité no encontrado');
    return item;
  }

  async create(dto: CreateTournamentCommitteeDto, user: any, companyId: number) {
    const item = this.repo.create({
      ...dto,
      companyId,
      createdBy: user?.user_id?.toString() || user?.id?.toString(),
      createdName: user?.user_name || user?.name,
    });
    return this.repo.save(item);
  }

  async update(id: string | number, dto: UpdateTournamentCommitteeDto, user: any) {
    const item = await this.get(id);
    Object.assign(item, dto, {
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
