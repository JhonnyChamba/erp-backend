import { SubscriptionsModuleRepository } from '../../domain/repositories/subscriptions-module.repository';
import { SubscriptionsModuleOrmEntity } from '../persistence/subscriptions-module.orm-entity';
import { SubscriptionsModule } from '../../domain/entities/subscriptions-module.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

@Injectable()
export class SubscriptionsModuleRepositoryImpl implements SubscriptionsModuleRepository {

	constructor(
		@InjectRepository(SubscriptionsModuleOrmEntity)
		private readonly repo: Repository<SubscriptionsModuleOrmEntity>,
	) { }

	async create(subModule: SubscriptionsModule): Promise<SubscriptionsModule> {

		const entity = this.repo.create({
			subscriptions: { id: subModule.subscriptionId },
			module: { id: subModule.moduleId },
		});

		const saved = await this.repo.save(entity);
		return this.toDomain(saved);
	}

	async findByCompany(subscriptionId: number, page: number, limit: number): Promise<{ data: SubscriptionsModule[]; total: number }> {
		const [subscriptionsModule, total] = await this.repo.findAndCount({
			where: { subscriptions: { id: subscriptionId } },
			skip: (page - 1) * limit,
			take: limit,
			order: { created_at: 'DESC' },
		});

		return {
			data: subscriptionsModule.map(subModule => this.toDomain(subModule)),
			total,
		};
	}

	async findById(id: number, subscriptionId: number): Promise<SubscriptionsModule | null> {
		const subModule = await this.repo.findOne({ where: { id, subscriptions: { id: subscriptionId } } });

		return subModule ? this.toDomain(subModule) : null;
	}

	async update(subModule: SubscriptionsModule): Promise<SubscriptionsModule> {
		await this.repo.update(
			{ id: subModule.id, subscriptions: { id: subModule.subscriptionId } },
			{ module: { id: subModule.moduleId } }
		);

		const updated = await this.repo.findOne({
			where: {
				id: subModule.id,
				subscriptions: { id: subModule.subscriptionId },
			},
		});

		return this.toDomain(updated);
	}

	private toDomain(entity: SubscriptionsModuleOrmEntity): SubscriptionsModule {
		return new SubscriptionsModule(
			entity.id,
			entity.subscriptions?.id, // ahora viene de relación
			entity.module?.id, // ahora viene de relación
		);
	}
}