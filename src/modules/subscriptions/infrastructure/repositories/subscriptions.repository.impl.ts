import { SubscriptionsRepository } from '../../domain/repositories/subscriptions.repository';
import { SubscriptionsOrmEntity } from '../persistence/subscriptions.orm-entity';
import { Subscriptions } from '../../domain/entities/subscriptions.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

@Injectable()
export class SubscriptionsRepositoryImpl implements SubscriptionsRepository {

	constructor(
		@InjectRepository(SubscriptionsOrmEntity)
		private readonly repo: Repository<SubscriptionsOrmEntity>,
	) { }

	async create(subscriptions: Subscriptions): Promise<Subscriptions> {

		const entity = this.repo.create({
			begin_date: subscriptions.begin_date,
			end_date: subscriptions.end_date,
			enabled: subscriptions.enabled,
			plan: { id: subscriptions.planId },
			company: { id: subscriptions.companyId },
			createdBy: { id: subscriptions.createdById }
		});

		const saved = await this.repo.save(entity);
		return this.toDomain(saved);
	}

	async findByCompany(companyId: number, page: number, limit: number): Promise<{ data: Subscriptions[]; total: number }> {

		const [subscriptionses, total] = await this.repo.findAndCount({
			where: { company: { id: companyId }, deleted: false },
			skip: (page - 1) * limit,
			take: limit,
			order: { created_at: 'DESC' },
		});

		return {
			data: subscriptionses.map(subscriptions => this.toDomain(subscriptions)),
			total,
		};
	}

	async findById(id: number, companyId: number): Promise<Subscriptions | null> {

		const subscriptions = await this.repo.findOne({
			where: {
				id,
				company: { id: companyId },
				deleted: false,
			},
		});

		return subscriptions ? this.toDomain(subscriptions) : null;
	}

	async update(subscriptions: Subscriptions): Promise<Subscriptions> {

		await this.repo.update(
			{
				id: subscriptions.id,
				company: { id: subscriptions.companyId }, // multi-tenant seguro
			},
			{
				begin_date: subscriptions.begin_date,
				end_date: subscriptions.end_date,
				enabled: subscriptions.enabled,
			},
		);

		const updated = await this.repo.findOne({
			where: {
				id: subscriptions.id,
				company: { id: subscriptions.companyId },
			},
		});

		return this.toDomain(updated);
	}

	private toDomain(entity: SubscriptionsOrmEntity): Subscriptions {
		return new Subscriptions(
			entity.id,
			entity.begin_date,
			entity.end_date,
			entity.plan?.id, // ahora viene de relación
			entity.company?.id, // ahora viene de relación
			entity.enabled,
			entity.created_at,
		);
	}
}