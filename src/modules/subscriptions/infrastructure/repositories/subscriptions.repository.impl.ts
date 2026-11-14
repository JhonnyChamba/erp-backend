import { SubscriptionsRepository } from '../../domain/repositories/subscriptions.repository';
import { SubscriptionsOrmEntity } from '../persistence/subscriptions.orm-entity';
import { SubscriptionsModuleOrmEntity } from 'src/modules/subscriptions-module/infrastructure/persistence/subscriptions-module.orm-entity';
import { RolesOrmEntity, RoleModuleOrmEntity } from 'src/modules/roles/infrastructure/persistence/roles.orm-entity';
import { AccessControlService } from 'src/auth/access-control.service';
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
		@InjectRepository(RolesOrmEntity)
		private readonly rolesRepo: Repository<RolesOrmEntity>,
		@InjectRepository(RoleModuleOrmEntity)
		private readonly roleModuleRepo: Repository<RoleModuleOrmEntity>,
	) { }

	async create(subscriptions: Subscriptions): Promise<Subscriptions> {
		if (subscriptions.companyId) {
			// Marcar las suscripciones anteriores de la empresa como inactivas para conservar el historial
			await this.repo
				.createQueryBuilder()
				.update(SubscriptionsOrmEntity)
				.set({ enabled: false })
				.where('company_id = :companyId AND deleted = false', { companyId: subscriptions.companyId })
				.execute();
		}

		const entity = this.repo.create({
			begin_date: subscriptions.begin_date,
			end_date: subscriptions.end_date,
			enabled: subscriptions.enabled !== false,
			plan: { id: subscriptions.planId },
			company: { id: subscriptions.companyId },
			createdBy: { id: subscriptions.createdById }
		});

		const saved = await this.repo.save(entity);

		let targetModIds = subscriptions.moduleIds || [];
		let targetSubModIds = subscriptions.subModuleIds || [];

		// Si se especifica un plan, respetar los módulos configurados en tab_plans_module
		if (subscriptions.planId) {
			const planMods = await this.repo.manager.query(
				'SELECT module_id FROM tab_plans_module WHERE plans_id = $1',
				[subscriptions.planId],
			);
			if (planMods && planMods.length > 0) {
				const planModIdSet = new Set<number>(planMods.map((r: any) => Number(r.module_id)));
				targetModIds = Array.from(planModIdSet);

				const subMods = await this.repo.manager.query(
					'SELECT id FROM tab_sub_module WHERE module_id = ANY($1) AND (deleted = false OR deleted IS NULL)',
					[targetModIds],
				);
				targetSubModIds = (subMods || []).map((r: any) => Number(r.id));
			}
		}

		await this.syncSubscriptionAccess(
			saved.id,
			targetModIds,
			targetSubModIds,
			subscriptions.companyId,
		);

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

		if (subscriptions.moduleIds !== undefined || subscriptions.subModuleIds !== undefined || subscriptions.planId) {
			let targetModIds = subscriptions.moduleIds || [];
			let targetSubModIds = subscriptions.subModuleIds || [];

			if (subscriptions.planId && targetModIds.length === 0) {
				const planMods = await this.repo.manager.query(
					'SELECT module_id FROM tab_plans_module WHERE plans_id = $1',
					[subscriptions.planId],
				);
				if (planMods && planMods.length > 0) {
					targetModIds = Array.from(new Set(planMods.map((r: any) => Number(r.module_id))));
					const subMods = await this.repo.manager.query(
						'SELECT id FROM tab_sub_module WHERE module_id = ANY($1) AND (deleted = false OR deleted IS NULL)',
						[targetModIds],
					);
					targetSubModIds = (subMods || []).map((r: any) => Number(r.id));
				}
			}

			await this.syncSubscriptionAccess(
				subscriptions.id!,
				targetModIds,
				targetSubModIds,
				subscriptions.companyId,
			);
		}

		const updated = await this.findById(subscriptions.id!, subscriptions.companyId);
		return updated!;
	}

	private async syncSubscriptionAccess(
		subscriptionId: number,
		moduleIds: number[],
		subModuleIds: number[],
		companyId?: number,
	): Promise<void> {
		AccessControlService.clearCache(companyId);
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

		// Asegurar que el rol "Administrador" de la empresa tenga acceso (true) a todo lo que tiene la suscripción
		let effectiveCompanyId = companyId;
		if (!effectiveCompanyId) {
			const subRow = await this.repo.findOne({
				where: { id: subscriptionId },
				relations: ['company'],
			});
			effectiveCompanyId = subRow?.company?.id;
		}
		if (effectiveCompanyId) {
			await this.syncAdminRoleWithSubscription(effectiveCompanyId, targetModIds, targetSubModIds);
		}
	}

	private async syncAdminRoleWithSubscription(
		companyId: number,
		moduleIds: number[],
		subModuleIds: number[],
	): Promise<void> {
		let adminRole = await this.rolesRepo
			.createQueryBuilder('r')
			.where('r.company_id = :companyId', { companyId })
			.andWhere('r.deleted = false')
			.andWhere('LOWER(r.description) LIKE :desc', { desc: 'administrador%' })
			.getOne();

		if (!adminRole) {
			const existingRoles = await this.rolesRepo.find({
				where: { company: { id: companyId } },
				select: ['id', 'code'],
				order: { id: 'DESC' },
			});
			const nextCode =
				existingRoles.length === 0
					? 'ROL-001'
					: `ROL-${String(existingRoles.length + 1).padStart(3, '0')}`;
			adminRole = await this.rolesRepo.save(
				this.rolesRepo.create({
					code: nextCode,
					description: 'Administrador',
					enabled: true,
					deleted: false,
					company: { id: companyId } as any,
				}),
			);
		}

		await this.roleModuleRepo
			.createQueryBuilder()
			.update(RoleModuleOrmEntity)
			.set({ deleted: true, enabled: false })
			.where('role_id = :roleId', { roleId: adminRole.id })
			.execute();

		for (const modId of moduleIds) {
			await this.roleModuleRepo.save(
				this.roleModuleRepo.create({
					role: { id: adminRole.id } as any,
					module: { id: modId } as any,
					subModule: null as any,
					has_access: true,
					enabled: true,
					deleted: false,
				}),
			);
		}

		for (const subModId of subModuleIds) {
			await this.roleModuleRepo.save(
				this.roleModuleRepo.create({
					role: { id: adminRole.id } as any,
					module: null as any,
					subModule: { id: subModId } as any,
					has_access: true,
					enabled: true,
					deleted: false,
				}),
			);
		}

		// Para el resto de roles de la empresa, desactivar accesos a módulos o submódulos que no estén en la suscripción
		const otherRoles = await this.rolesRepo
			.createQueryBuilder('r')
			.where('r.company_id = :companyId AND r.id != :adminId AND r.deleted = false', {
				companyId,
				adminId: adminRole.id,
			})
			.getMany();

		for (const r of otherRoles) {
			if (moduleIds.length > 0) {
				await this.roleModuleRepo
					.createQueryBuilder()
					.update(RoleModuleOrmEntity)
					.set({ enabled: false, has_access: false })
					.where('role_id = :roleId AND module_id IS NOT NULL AND module_id NOT IN (:...modIds)', {
						roleId: r.id,
						modIds: moduleIds,
					})
					.execute();
			} else {
				await this.roleModuleRepo
					.createQueryBuilder()
					.update(RoleModuleOrmEntity)
					.set({ enabled: false, has_access: false })
					.where('role_id = :roleId AND module_id IS NOT NULL', { roleId: r.id })
					.execute();
			}

			if (subModuleIds.length > 0) {
				await this.roleModuleRepo
					.createQueryBuilder()
					.update(RoleModuleOrmEntity)
					.set({ enabled: false, has_access: false })
					.where('role_id = :roleId AND sub_module_id IS NOT NULL AND sub_module_id NOT IN (:...subModIds)', {
						roleId: r.id,
						subModIds: subModuleIds,
					})
					.execute();
			} else {
				await this.roleModuleRepo
					.createQueryBuilder()
					.update(RoleModuleOrmEntity)
					.set({ enabled: false, has_access: false })
					.where('role_id = :roleId AND sub_module_id IS NOT NULL', { roleId: r.id })
					.execute();
			}
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