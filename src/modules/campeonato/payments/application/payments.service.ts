import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeamRegistrationOrmEntity } from '../../infrastructure/persistence/team-registration.orm-entity';
import { assertBelongsToCompany, ensureCompanyScope } from '../../common/company-scope.util';
import { PaymentOrmEntity } from '../../infrastructure/persistence/payment.orm-entity';
import { CreatePaymentDto, UpdatePaymentDto } from './dto/payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(PaymentOrmEntity)
    private readonly repo: Repository<PaymentOrmEntity>,
  ) {}

  async list(companyId: number, query: { page?: number; limit?: number; search?: string }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const qb = this.repo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.teamRegistration', 'teamRegistration')
      .leftJoinAndSelect('teamRegistration.team', 'team');

    if (companyId) {
      qb.andWhere('(p.companyId = :companyId OR p.companyId IS NULL)', { companyId });
    }
    if (query.search?.trim()) {
      qb.andWhere('(LOWER(p.receiptNumber) LIKE :term OR LOWER(p.notes) LIKE :term OR LOWER(team.name) LIKE :term)', {
        term: `%${query.search.trim().toLowerCase()}%`,
      });
    }

    qb.orderBy('p.createdAt', 'DESC').skip(skip).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async get(id: string | number, companyId: number, write = false) {
    const item = await this.repo.findOne({
      where: { id: Number(id) },
      relations: ['teamRegistration', 'teamRegistration.team'],
    });
    return ensureCompanyScope(item, companyId, 'Pago no encontrado', write);
  }

  async create(dto: CreatePaymentDto, user: any, companyId: number) {
    await assertBelongsToCompany(this.repo.manager.getRepository(TeamRegistrationOrmEntity), dto.teamRegistrationId, companyId, 'Inscripción de equipo no encontrada');
    const item = this.repo.create({
      ...dto,
      companyId,
      createdBy: user?.user_id?.toString() || user?.id?.toString(),
      createdName: user?.user_name || user?.name,
    });
    return this.repo.save(item);
  }

  async update(id: string | number, dto: UpdatePaymentDto, user: any, companyId: number) {
    const item = await this.get(id, companyId, true);
    await assertBelongsToCompany(this.repo.manager.getRepository(TeamRegistrationOrmEntity), dto.teamRegistrationId, companyId, 'Inscripción de equipo no encontrada');
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
