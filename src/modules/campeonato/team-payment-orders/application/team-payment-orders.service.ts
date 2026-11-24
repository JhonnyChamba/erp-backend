import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ensureCompanyScope } from '../../common/company-scope.util';
import { PaymentConcept, PaymentOrderStatus } from '../../common/enum/campeonato.enum';
import { TeamPaymentOrderOrmEntity } from '../../infrastructure/persistence/team-payment-order.orm-entity';
import { TeamPaymentOrderConcept, TeamPaymentOrderDetailOrmEntity } from '../../infrastructure/persistence/team-payment-order-detail.orm-entity';
import { TeamRegistrationOrmEntity } from '../../infrastructure/persistence/team-registration.orm-entity';
import { CategoryEditionOrmEntity } from '../../infrastructure/persistence/category-edition.orm-entity';
import { EditionCategoryDetailOrmEntity } from '../../infrastructure/persistence/edition-category-detail.orm-entity';
import { CategoryOrmEntity } from '../../infrastructure/persistence/category.orm-entity';
import { TeamOrmEntity } from '../../infrastructure/persistence/team.orm-entity';

const round2 = (value: unknown): number => Math.round((Number(value) || 0) * 100) / 100;

@Injectable()
export class TeamPaymentOrdersService {
  constructor(
    @InjectRepository(TeamPaymentOrderOrmEntity)
    private readonly repo: Repository<TeamPaymentOrderOrmEntity>,
    @InjectRepository(TeamPaymentOrderDetailOrmEntity)
    private readonly detailRepo: Repository<TeamPaymentOrderDetailOrmEntity>,
    @InjectRepository(CategoryEditionOrmEntity)
    private readonly editionRepo: Repository<CategoryEditionOrmEntity>,
    @InjectRepository(EditionCategoryDetailOrmEntity)
    private readonly editionDetailRepo: Repository<EditionCategoryDetailOrmEntity>,
    @InjectRepository(CategoryOrmEntity)
    private readonly categoryRepo: Repository<CategoryOrmEntity>,
    @InjectRepository(TeamOrmEntity)
    private readonly teamRepo: Repository<TeamOrmEntity>,
  ) {}

  /**
   * Genera las órdenes de pago de las inscripciones nuevas: una orden por equipo y edición, con una línea por cada
   * categoría inscrita y, en cada línea, dos conceptos: la inscripción y la garantía de esa categoría.
   * Una orden sin valor a cobrar no se genera.
   */
  async generateForRegistrations(registrations: TeamRegistrationOrmEntity[], user: any, companyId: number): Promise<TeamPaymentOrderOrmEntity[]> {
    if (registrations.length === 0) return [];

    const editionIds = [...new Set(registrations.map((r) => Number(r.categoryEditionId)))];
    const teamIds = [...new Set(registrations.map((r) => Number(r.teamId)))];
    const categoryIds = [...new Set(registrations.map((r) => Number(r.categoryId)).filter(Boolean))];

    const [editions, editionDetails, categories, teams] = await Promise.all([
      this.editionRepo.find({ where: { id: In(editionIds) } }),
      this.editionDetailRepo.find({ where: { editionId: In(editionIds) } }),
      categoryIds.length ? this.categoryRepo.find({ where: { id: In(categoryIds) } }) : Promise.resolve([] as CategoryOrmEntity[]),
      this.teamRepo.find({ where: { id: In(teamIds) } }),
    ]);

    const actor = { createdBy: user?.user_id?.toString() || user?.id?.toString(), createdName: user?.user_name || user?.name };
    const groups = new Map<string, TeamRegistrationOrmEntity[]>();
    for (const registration of registrations) {
      const key = `${Number(registration.categoryEditionId)}_${Number(registration.teamId)}`;
      groups.set(key, [...(groups.get(key) ?? []), registration]);
    }

    const orders: TeamPaymentOrderOrmEntity[] = [];
    for (const [key, teamRegistrations] of groups) {
      const [editionId, teamId] = key.split('_').map(Number);
      const edition = editions.find((item) => Number(item.id) === editionId);
      const team = teams.find((item) => Number(item.id) === teamId);
      if (!edition || !team) continue;

      const lines = teamRegistrations.map((registration) => {
        const category = categories.find((item) => Number(item.id) === Number(registration.categoryId));
        const categoryDetail = editionDetails.find((item) => Number(item.editionId) === editionId && Number(item.categoryId) === Number(registration.categoryId));
        const concepts: TeamPaymentOrderConcept[] = [
          { conceptType: PaymentConcept.REGISTRATION_FEE, description: 'Inscripción', amount: round2(categoryDetail?.registrationFee) },
          { conceptType: PaymentConcept.GUARANTEE_FEE, description: 'Garantía', amount: round2(categoryDetail?.guaranteeFee) },
        ];

        return {
          registration,
          categoryName: category?.name || categoryDetail?.categoryDescription || 'Sin categoría',
          concepts,
          subtotal: round2(concepts.reduce((total, concept) => total + concept.amount, 0)),
        };
      });

      const totalAmount = round2(lines.reduce((total, line) => total + line.subtotal, 0));
      if (totalAmount <= 0) continue;

      const order = await this.repo.save(
        this.repo.create({
          companyId,
          categoryEditionId: editionId,
          editionName: edition.name,
          teamId,
          teamName: team.name,
          totalAmount,
          status: PaymentOrderStatus.PENDING,
          ...actor,
        }),
      );
      order.details = await this.detailRepo.save(
        lines.map((line) =>
          this.detailRepo.create({
            orderId: order.id,
            teamRegistrationId: line.registration.id,
            categoryId: line.registration.categoryId ?? undefined,
            categoryName: line.categoryName,
            subtotal: line.subtotal,
            concepts: line.concepts,
          }),
        ),
      );
      orders.push(order);
    }

    return orders;
  }

  async list(companyId: number, query: { page?: number; limit?: number; search?: string; status?: string; categoryEditionId?: number; teamId?: number }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));

    const qb = this.repo.createQueryBuilder('o').leftJoinAndSelect('o.details', 'details').where('o.companyId = :companyId', { companyId });
    if (query.status) qb.andWhere('o.status = :status', { status: query.status });
    if (query.categoryEditionId) qb.andWhere('o.categoryEditionId = :categoryEditionId', { categoryEditionId: Number(query.categoryEditionId) });
    if (query.teamId) qb.andWhere('o.teamId = :teamId', { teamId: Number(query.teamId) });
    if (query.search?.trim()) {
      qb.andWhere('(LOWER(o.teamName) LIKE :term OR LOWER(o.editionName) LIKE :term)', { term: `%${query.search.trim().toLowerCase()}%` });
    }

    qb.orderBy('o.createdAt', 'DESC').addOrderBy('details.id', 'ASC').skip((page - 1) * limit).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async get(id: string | number, companyId: number) {
    const item = await this.repo.findOne({ where: { id: Number(id) }, relations: ['details'] });
    return ensureCompanyScope(item, companyId, 'Orden de pago no encontrada');
  }
}
