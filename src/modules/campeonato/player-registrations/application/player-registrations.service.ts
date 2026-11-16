import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlayerRegistrationOrmEntity } from '../../infrastructure/persistence/player-registration.orm-entity';
import { CreatePlayerRegistrationDto, UpdatePlayerRegistrationDto } from './dto/player-registration.dto';

@Injectable()
export class PlayerRegistrationsService {
  constructor(
    @InjectRepository(PlayerRegistrationOrmEntity)
    private readonly repo: Repository<PlayerRegistrationOrmEntity>,
  ) {}

  async list(companyId: number, query: { page?: number; limit?: number; search?: string }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const qb = this.repo
      .createQueryBuilder('pr')
      .leftJoinAndSelect('pr.teamRegistration', 'teamRegistration')
      .leftJoinAndSelect('teamRegistration.team', 'team')
      .leftJoinAndSelect('pr.player', 'player');

    if (companyId) {
      qb.andWhere('(pr.companyId = :companyId OR pr.companyId IS NULL)', { companyId });
    }
    if (query.search?.trim()) {
      qb.andWhere('(LOWER(player.name) LIKE :term OR LOWER(player.lastName) LIKE :term OR LOWER(pr.carnetCode) LIKE :term)', {
        term: `%${query.search.trim().toLowerCase()}%`,
      });
    }

    qb.orderBy('pr.createdAt', 'DESC').skip(skip).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async get(id: string) {
    const item = await this.repo.findOne({
      where: { id },
      relations: ['teamRegistration', 'teamRegistration.team', 'player'],
    });
    if (!item) throw new NotFoundException('Inscripción de jugador no encontrada');
    return item;
  }

  async create(dto: CreatePlayerRegistrationDto, user: any, companyId: number) {
    const item = this.repo.create({
      ...dto,
      registrationDate: dto.registrationDate ? new Date(dto.registrationDate) : undefined,
      companyId,
      createdBy: user?.user_id?.toString() || user?.id?.toString(),
      createdName: user?.user_name || user?.name,
    });
    return this.repo.save(item);
  }

  async update(id: string, dto: UpdatePlayerRegistrationDto, user: any) {
    const item = await this.get(id);
    Object.assign(item, dto, {
      registrationDate: dto.registrationDate ? new Date(dto.registrationDate) : item.registrationDate,
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
