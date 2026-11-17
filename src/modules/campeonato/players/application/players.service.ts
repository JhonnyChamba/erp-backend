import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlayerOrmEntity } from '../../infrastructure/persistence/player.orm-entity';
import { CreatePlayerDto, UpdatePlayerDto } from './dto/player.dto';

export function validarCedulaEcuador(cedula: string): boolean {
  if (!cedula || !/^\d{10}$/.test(cedula.trim())) return false;
  const prov = parseInt(cedula.substring(0, 2), 10);
  if (!((prov >= 1 && prov <= 24) || prov === 30)) return false;
  if (parseInt(cedula.charAt(2), 10) >= 6) return false;

  const coef = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    let p = parseInt(cedula.charAt(i), 10) * coef[i];
    if (p >= 10) p -= 9;
    sum += p;
  }
  const digitoVerificador = sum % 10 === 0 ? 0 : 10 - (sum % 10);
  return digitoVerificador === parseInt(cedula.charAt(9), 10);
}

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

    const qb = this.repo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.demarcation', 'demarcation')
      .leftJoinAndSelect('p.currentTeam', 'currentTeam')
      .leftJoinAndSelect('p.passOwnerTeam', 'passOwnerTeam');

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
    const item = await this.repo.findOne({
      where: { id },
      relations: ['demarcation', 'currentTeam', 'passOwnerTeam'],
    });
    if (!item) throw new NotFoundException('Jugador no encontrado');
    return item;
  }

  async create(dto: CreatePlayerDto, user: any, companyId: number) {
    if (dto.identification && !dto.isForeigner) {
      if (!validarCedulaEcuador(dto.identification)) {
        throw new BadRequestException('El número de identificación ingresado no es una cédula ecuatoriana válida (algoritmo Módulo 10).');
      }
    }

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

    const targetIdent = dto.identification !== undefined ? dto.identification : item.identification;
    const targetForeigner = dto.isForeigner !== undefined ? dto.isForeigner : item.isForeigner;
    if (targetIdent && !targetForeigner) {
      if (!validarCedulaEcuador(targetIdent)) {
        throw new BadRequestException('El número de identificación ingresado no es una cédula ecuatoriana válida (algoritmo Módulo 10).');
      }
    }

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
