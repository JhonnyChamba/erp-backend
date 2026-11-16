import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlayerOrmEntity } from '../../infrastructure/persistence/player.orm-entity';
import { CreatePlayerDto, UpdatePlayerDto } from './dto/player.dto';

@Injectable()
export class PlayersService {
  constructor(
    @InjectRepository(PlayerOrmEntity)
    private readonly repo: Repository<PlayerOrmEntity>,
  ) {}

  async list(companyId: number, query: { page?: number; limit?: number; search?: string }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const qb = this.repo.createQueryBuilder('p').leftJoinAndSelect('p.demarcation', 'demarcation');
    if (companyId) {
      qb.andWhere('(p.companyId = :companyId OR p.companyId IS NULL)', { companyId });
    }
    if (query.search?.trim()) {
      qb.andWhere('(LOWER(p.name) LIKE :term OR LOWER(p.lastName) LIKE :term OR LOWER(p.identification) LIKE :term)', {
        term: `%${query.search.trim().toLowerCase()}%`,
      });
    }

    qb.orderBy('p.createdAt', 'DESC').skip(skip).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async get(id: string) {
    const item = await this.repo.findOne({ where: { id }, relations: ['demarcation'] });
    if (!item) throw new NotFoundException('Jugador no encontrado');
    return item;
  }

  async create(dto: CreatePlayerDto, user: any, companyId: number) {
    const item = this.repo.create({
      ...dto,
      birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
      medicalClearanceExpiry: dto.medicalClearanceExpiry ? new Date(dto.medicalClearanceExpiry) : undefined,
      companyId,
      createdBy: user?.user_id?.toString() || user?.id?.toString(),
      createdName: user?.user_name || user?.name,
    });
    return this.repo.save(item);
  }

  async update(id: string, dto: UpdatePlayerDto, user: any) {
    const item = await this.get(id);
    Object.assign(item, dto, {
      birthDate: dto.birthDate ? new Date(dto.birthDate) : item.birthDate,
      medicalClearanceExpiry: dto.medicalClearanceExpiry ? new Date(dto.medicalClearanceExpiry) : item.medicalClearanceExpiry,
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
