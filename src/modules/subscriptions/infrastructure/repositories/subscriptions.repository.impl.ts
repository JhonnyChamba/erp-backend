import { SubscriptionsRepository } from '../../domain/repositories/subscriptions.repository';
import { SubscriptionsOrmEntity } from '../persistence/subscriptions.orm-entity';
import { SubscriptionsModuleOrmEntity } from 'src/modules/subscriptions-module/infrastructure/persistence/subscriptions-module.orm-entity';
import { Subscriptions } from '../../domain/entities/subscriptions.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

@Injectable()
export class SubscriptionsRepositoryImpl implements SubscriptionsRepository {

	constructor(
		@InjectRepository(SubscriptionsOrmEntity)
		private readonly repo: Repository<SubscriptionsOrmEntity>,
		@InjectRepository(SubscriptionsModuleOrmEntity)
		private readonly subModuleRepo: Repository<SubscriptionsModuleOrmEntity>,
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

		if (
			(subscriptions.moduleIds && subscriptions.moduleIds.length > 0) ||
			(subscriptions.subModuleIds && subscriptions.subModuleIds.length > 0)
		) {
			await this.syncSubscriptionAccess(
				saved.id,
				subscriptions.moduleIds || [],
				subscriptions.subModuleIds || [],
			);
		}

		const full = await this.findById(saved.id, subscriptions.companyId);
		return full || this.toDomain(saved);
	}

	async findByCompany(companyId: number, page: number, limit: number): Promise<{ data: Subscriptions[]; total: number }> {

		const [subscriptionses, total] = await this.repo.findAndCount({
			where: { company: { id: companyId }, deleted: false },
			relations: ['plan', 'company', 'subscriptionModules', 'subscriptionModules.module', 'subscriptionModules.subModule'],
			skip: (page - 1) * limit,
			take: limit,
			order: { created_at: 'DESC' },
		});

		return {
			data: subscriptionses.map(subscriptions => this.toDomain(subscriptions)),
			total,
		};
	}

	async findById(id: number, companyId?: number): Promise<Subscriptions | null> {
		const whereClause: any = { id, deleted: false };
		if (companyId) {
			whereClause.company = { id: companyId };
		}

		const subscriptions = await this.repo.findOne({
			where: whereClause,
			relations: ['plan', 'company', 'subscriptionModules', 'subscriptionModules.module', 'subscriptionModules.subModule'],
		});

		return subscriptions ? this.toDomain(subscriptions) : null;
	}

	async update(subscriptions: Subscriptions): Promise<Subscriptions> {
		const whereClause: any = { id: subscriptions.id };
		if (subscriptions.companyId) {
			whereClause.company = { id: subscriptions.companyId };
		}

		await this.repo.update(
			whereClause,
			{
				plan: subscriptions.planId ? ({ id: subscriptions.planId } as any) : undefined,
				begin_date: subscriptions.begin_date,
				end_date: subscriptions.end_date,
				enabled: subscriptions.enabled,
			},
		);

		if (subscriptions.moduleIds !== undefined || subscriptions.subModuleIds !== undefined) {
			await this.syncSubscriptionAccess(
				subscriptions.id!,
				subscriptions.moduleIds || [],
				subscriptions.subModuleIds || [],
			);
		}

		const updated = await this.findById(subscriptions.id!, subscriptions.companyId);
		return updated!;
	}

	private async syncSubscriptionAccess(
		subscriptionId: number,
		moduleIds: number[],
		subModuleIds: number[],
	): Promise<void> {
		const targetModIds = Array.from(
			new Set((moduleIds || []).map(Number).filter((id) => !isNaN(id) && id > 0)),
		);
		const targetSubModIds = Array.from(
			new Set((subModuleIds || []).map(Number).filter((id) => !isNaN(id) && id > 0)),
		);

		// Desactivar asignaciones previas de esta suscripción
		await this.subModuleRepo
			.createQueryBuilder()
			.update(SubscriptionsModuleOrmEntity)
			.set({ deleted: true, enabled: false })
			.where('subscriptions_id = :subscriptionId', { subscriptionId })
			.execute();

		// Insertar módulos principales seleccionados
		for (const modId of targetModIds) {
			const entity = this.subModuleRepo.create({
				subscriptions: { id: subscriptionId } as any,
				module: { id: modId } as any,
				subModule: null as any,
				enabled: true,
				deleted: false,
			});
			await this.subModuleRepo.save(entity);
		}

		// Insertar submódulos seleccionados
		for (const subModId of targetSubModIds) {
			const entity = this.subModuleRepo.create({
				subscriptions: { id: subscriptionId } as any,
				module: null as any,
				subModule: { id: subModId } as any,
				enabled: true,
				deleted: false,
			});
			await this.subModuleRepo.save(entity);
		}
	}

	private toDomain(entity: SubscriptionsOrmEntity): Subscriptions {
		const activeItems = (entity.subscriptionModules || []).filter(
			(sm) => !sm.deleted && sm.enabled !== false,
		);

		const moduleIds = Array.from(
			new Set(
				activeItems
					.filter((sm) => sm.module?.id)
					.map((sm) => Number(sm.module.id)),
			),
		);

		const subModuleIds = Array.from(
			new Set(
				activeItems
					.filter((sm) => sm.subModule?.id)
					.map((sm) => Number(sm.subModule.id)),
			),
		);

		return new Subscriptions(
			entity.id,
			entity.begin_date,
			entity.end_date,
			entity.plan?.id,
			entity.company?.id,
			entity.enabled,
			entity.created_at,
			entity.created_by,
			moduleIds,
			subModuleIds,
		);
	}
}