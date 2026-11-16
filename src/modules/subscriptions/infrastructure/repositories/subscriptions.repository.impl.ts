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

		// Si se especifica un plan, respetar los módulos y submódulos configurados en tab_plans_module
		if (subscriptions.planId && (targetModIds.length === 0 || targetSubModIds.length === 0)) {
			const planPms = await this.repo.manager.query(
				'SELECT module_id, sub_module_id FROM tab_plans_module WHERE plans_id = $1',
				[subscriptions.planId],
			);
			if (planPms && planPms.length > 0) {
				const pModIds: number[] = [];
				const pSubModIds: number[] = [];
				for (const r of planPms) {
					if (r.sub_module_id) pSubModIds.push(Number(r.sub_module_id));
					else if (r.module_id) pModIds.push(Number(r.module_id));
				}
				if (targetModIds.length === 0) targetModIds = Array.from(new Set(pModIds));
				if (targetSubModIds.length === 0) targetSubModIds = Array.from(new Set(pSubModIds));
			}
		}

		// Si sigue vacío (el plan no tenía módulos específicos o no se pasaron), asignar TODOS los módulos activos
		if (targetModIds.length === 0) {
			const allActiveMods = await this.repo.manager.query(
				'SELECT id FROM tab_module WHERE enabled = true AND (deleted = false OR deleted IS NULL) ORDER BY id ASC',
			);
			targetModIds = (allActiveMods || []).map((m: any) => Number(m.id));

			const allActiveSubMods = await this.repo.manager.query(
				'SELECT id FROM tab_sub_module WHERE enabled = true AND (deleted = false OR deleted IS NULL) ORDER BY id ASC',
			);
			targetSubModIds = (allActiveSubMods || []).map((sm: any) => Number(sm.id));
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

		if (subscriptions.companyId && subscriptions.enabled === true) {
			// Si esta suscripción se marca como activa/vigente, cualquier otra suscripción de esta misma empresa queda inactiva
			await this.repo
				.createQueryBuilder()
				.update(SubscriptionsOrmEntity)
				.set({ enabled: false })
				.where('company_id = :companyId AND id != :id AND deleted = false', {
					companyId: subscriptions.companyId,
					id: subscriptions.id,
				})
				.execute();
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

			if (subscriptions.planId && (targetModIds.length === 0 || targetSubModIds.length === 0)) {
				const planPms = await this.repo.manager.query(
					'SELECT module_id, sub_module_id FROM tab_plans_module WHERE plans_id = $1',
					[subscriptions.planId],
				);
				if (planPms && planPms.length > 0) {
					const pModIds: number[] = [];
					const pSubModIds: number[] = [];
					for (const r of planPms) {
						if (r.sub_module_id) pSubModIds.push(Number(r.sub_module_id));
						else if (r.module_id) pModIds.push(Number(r.module_id));
					}
					if (targetModIds.length === 0) targetModIds = Array.from(new Set(pModIds));
					if (targetSubModIds.length === 0) targetSubModIds = Array.from(new Set(pSubModIds));
				}
			}

			// Si sigue vacío, asignar todos los módulos y submódulos activos del sistema
			if (targetModIds.length === 0) {
				const allActiveMods = await this.repo.manager.query(
					'SELECT id FROM tab_module WHERE enabled = true AND (deleted = false OR deleted IS NULL) ORDER BY id ASC',
				);
				targetModIds = (allActiveMods || []).map((m: any) => Number(m.id));

				const allActiveSubMods = await this.repo.manager.query(
					'SELECT id FROM tab_sub_module WHERE enabled = true AND (deleted = false OR deleted IS NULL) ORDER BY id ASC',
				);
				targetSubModIds = (allActiveSubMods || []).map((sm: any) => Number(sm.id));
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
		let targetModIds = Array.from(
			new Set((moduleIds || []).map(Number).filter((id) => !isNaN(id) && id > 0)),
		);
		let targetSubModIds = Array.from(
			new Set((subModuleIds || []).map(Number).filter((id) => !isNaN(id) && id > 0)),
		);

		// Si no se pasaron módulos explícitos, consultar los módulos y submódulos del plan en tab_plans_module
		if (targetModIds.length === 0 || targetSubModIds.length === 0) {
			const subRow = await this.repo.findOne({
				where: { id: subscriptionId },
				relations: ['plan'],
			});
			const planId = subRow?.plan?.id || (subRow as any)?.plan_id;
			if (planId) {
				const planPms = await this.repo.manager.query(
					'SELECT module_id, sub_module_id FROM tab_plans_module WHERE plans_id = $1',
					[planId],
				);
				if (planPms && planPms.length > 0) {
					const pModIds: number[] = [];
					const pSubModIds: number[] = [];
					for (const r of planPms) {
						if (r.sub_module_id) pSubModIds.push(Number(r.sub_module_id));
						else if (r.module_id) pModIds.push(Number(r.module_id));
					}
					if (targetModIds.length === 0) targetModIds = Array.from(new Set(pModIds));
					if (targetSubModIds.length === 0) targetSubModIds = Array.from(new Set(pSubModIds));
				}
			}
		}

		// Si sigue vacío, asignar todos los módulos y submódulos activos del sistema
		if (targetModIds.length === 0) {
			const allActiveMods = await this.repo.manager.query(
				'SELECT id FROM tab_module WHERE enabled = true AND (deleted = false OR deleted IS NULL) ORDER BY id ASC',
			);
			targetModIds = (allActiveMods || []).map((m: any) => Number(m.id));

			const allActiveSubMods = await this.repo.manager.query(
				'SELECT id FROM tab_sub_module WHERE enabled = true AND (deleted = false OR deleted IS NULL) ORDER BY id ASC',
			);
			targetSubModIds = (allActiveSubMods || []).map((sm: any) => Number(sm.id));
		}

		// Borrar asignaciones previas de esta suscripción
		await this.subModuleRepo
			.createQueryBuilder()
			.delete()
			.from(SubscriptionsModuleOrmEntity)
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

		// Asegurar sincronización completa de roles con la nueva configuración
		let effectiveCompanyId = companyId;
		if (!effectiveCompanyId) {
			const subRow = await this.repo.findOne({
				where: { id: subscriptionId },
				relations: ['company'],
			});
			effectiveCompanyId = subRow?.company?.id;
		}
		if (effectiveCompanyId) {
			await this.syncCompanyRolesWithSubscription(effectiveCompanyId, targetModIds, targetSubModIds);
		}
	}

	private async syncCompanyRolesWithSubscription(
		companyId: number,
		moduleIds: number[],
		subModuleIds: number[],
	): Promise<void> {
		AccessControlService.clearCache(companyId);

		// 1. Obtener o crear el rol Administrador predeterminado de la empresa
		let adminRole = await this.rolesRepo
			.createQueryBuilder('r')
			.where('r.company_id = :companyId', { companyId })
			.andWhere('r.deleted = false')
			.andWhere('(r.is_company_admin = true OR LOWER(r.description) LIKE :desc)', { desc: 'administrador%' })
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
					is_company_admin: true,
					enabled: true,
					deleted: false,
					company: { id: companyId } as any,
				}),
			);
		} else if (!adminRole.is_company_admin) {
			await this.rolesRepo.update({ id: adminRole.id }, { is_company_admin: true });
			adminRole.is_company_admin = true;
		}

		// 2. Borrar asignaciones previas del rol Administrador
		await this.roleModuleRepo
			.createQueryBuilder()
			.delete()
			.from(RoleModuleOrmEntity)
			.where('role_id = :roleId', { roleId: adminRole.id })
			.execute();

		// 3. Insertar la nueva configuración de la suscripción con has_access = true en el Administrador
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

		// 4. Para TODOS los demás roles de la empresa:
		// Conservar la configuración previa de permisos para los módulos que continúan,
		// retirar los que ya no están en la suscripción, e insertar los nuevos con has_access = false
		const otherRoles = await this.rolesRepo
			.createQueryBuilder('r')
			.where('r.company_id = :companyId AND r.id != :adminId AND r.deleted = false', {
				companyId,
				adminId: adminRole.id,
			})
			.getMany();

		const validModSet = new Set(moduleIds);
		const validSubModSet = new Set(subModuleIds);

		for (const r of otherRoles) {
			const existingRoleModules = await this.roleModuleRepo.find({
				where: { role: { id: r.id }, deleted: false },
				relations: ['module', 'subModule'],
			});

			const existingModIds = new Set<number>();
			const existingSubModIds = new Set<number>();

			for (const rm of existingRoleModules) {
				if (rm.subModule?.id) {
					const smId = Number(rm.subModule.id);
					if (!validSubModSet.has(smId)) {
						await this.roleModuleRepo.delete({ id: rm.id });
					} else {
						existingSubModIds.add(smId);
					}
				} else if (rm.module?.id) {
					const mId = Number(rm.module.id);
					if (!validModSet.has(mId)) {
						await this.roleModuleRepo.delete({ id: rm.id });
					} else {
						existingModIds.add(mId);
					}
				}
			}

			// Insertar módulos nuevos que no tenía el rol con has_access = false
			for (const modId of moduleIds) {
				if (!existingModIds.has(modId)) {
					await this.roleModuleRepo.save(
						this.roleModuleRepo.create({
							role: { id: r.id } as any,
							module: { id: modId } as any,
							subModule: null as any,
							has_access: false,
							enabled: true,
							deleted: false,
						}),
					);
				}
			}

			// Insertar submódulos nuevos que no tenía el rol con has_access = false
			for (const subModId of subModuleIds) {
				if (!existingSubModIds.has(subModId)) {
					await this.roleModuleRepo.save(
						this.roleModuleRepo.create({
							role: { id: r.id } as any,
							module: null as any,
							subModule: { id: subModId } as any,
							has_access: false,
							enabled: true,
							deleted: false,
						}),
					);
				}
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