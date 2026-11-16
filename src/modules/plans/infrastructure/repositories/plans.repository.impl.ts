import { PlansRepository } from '../../domain/repositories/plans.repository';
import { PlansOrmEntity } from '../persistence/plans.orm-entity';
import { Plans } from '../../domain/entities/plans.entity';
import { AccessControlService } from 'src/auth/access-control.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

@Injectable()
export class PlansRepositoryImpl implements PlansRepository {

	constructor(
		@InjectRepository(PlansOrmEntity)
		private readonly repo: Repository<PlansOrmEntity>,
	) { }

	async create(company: Plans): Promise<Plans> {
		const targetModIds = Array.from(new Set((company.moduleIds || []).map(Number).filter((id) => !isNaN(id) && id > 0)));
		const targetSubModIds = Array.from(new Set((company.subModuleIds || []).map(Number).filter((id) => !isNaN(id) && id > 0)));

		const entity = this.repo.create({
			price: company.price,
			billing_cycle: company.billing_cycle,
			description: company.description,
			max_users: company.max_users,
			max_branches: company.max_branches,
			enabled: company.enabled,
			created_name: company.created_name,
			createdBy: { id: company.createdById }
		});

		const saved = await this.repo.save(entity);

		// 1. Guardar módulos principales en tab_plans_module
		for (const modId of targetModIds) {
			await this.repo.manager.query(
				'INSERT INTO tab_plans_module (plans_id, module_id, sub_module_id) VALUES ($1, $2, NULL)',
				[saved.id, modId],
			);
		}

		// 2. Guardar submódulos en tab_plans_module
		if (targetSubModIds.length > 0) {
			const subModRows = await this.repo.manager.query(
				'SELECT id, module_id FROM tab_sub_module WHERE id = ANY($1)',
				[targetSubModIds],
			);
			for (const row of subModRows || []) {
				await this.repo.manager.query(
					'INSERT INTO tab_plans_module (plans_id, module_id, sub_module_id) VALUES ($1, $2, $3)',
					[saved.id, row.module_id, row.id],
				);
			}
		}

		const domain = this.toDomain(saved);
		domain.moduleIds = targetModIds;
		domain.subModuleIds = targetSubModIds;
		return domain;
	}

	async findByPlans(page: number, limit: number, search?: string): Promise<{ data: Plans[]; total: number }> {
		const qb = this.repo.createQueryBuilder('p');

		if (search && search.trim()) {
			qb.where('LOWER(p.description) LIKE :search', {
				search: `%${search.trim().toLowerCase()}%`,
			});
		}

		qb.orderBy('p.createdAt', 'DESC')
			.skip((page - 1) * limit)
			.take(limit);

		const [branches, total] = await qb.getManyAndCount();

		const planIds = branches.map((b) => b.id);
		const modMap: Record<number, number[]> = {};
		const subModMap: Record<number, number[]> = {};

		if (planIds.length > 0) {
			const pms = await this.repo.manager.query(
				'SELECT plans_id, module_id, sub_module_id FROM tab_plans_module WHERE plans_id = ANY($1)',
				[planIds],
			);
			for (const row of pms || []) {
				const pId = Number(row.plans_id);
				if (!modMap[pId]) modMap[pId] = [];
				if (!subModMap[pId]) subModMap[pId] = [];

				if (row.sub_module_id) {
					subModMap[pId].push(Number(row.sub_module_id));
				} else if (row.module_id) {
					modMap[pId].push(Number(row.module_id));
				}
			}
		}

		return {
			data: branches.map((company) => {
				const d = this.toDomain(company);
				d.moduleIds = Array.from(new Set(modMap[d.id!] || []));
				d.subModuleIds = Array.from(new Set(subModMap[d.id!] || []));
				return d;
			}),
			total,
		};
	}

	async findById(id: number): Promise<Plans | null> {
		const company = await this.repo.findOne({ where: { id } });
		if (!company) return null;
		const domain = this.toDomain(company);
		const pms = await this.repo.manager.query(
			'SELECT module_id, sub_module_id FROM tab_plans_module WHERE plans_id = $1',
			[id],
		);
		const modIds: number[] = [];
		const subModIds: number[] = [];
		for (const row of pms || []) {
			if (row.sub_module_id) {
				subModIds.push(Number(row.sub_module_id));
			} else if (row.module_id) {
				modIds.push(Number(row.module_id));
			}
		}
		domain.moduleIds = Array.from(new Set(modIds));
		domain.subModuleIds = Array.from(new Set(subModIds));
		return domain;
	}

	async update(company: Plans): Promise<Plans> {
		const newModIds = company.moduleIds !== undefined
			? Array.from(new Set(company.moduleIds.map(Number).filter((id) => !isNaN(id) && id > 0)))
			: undefined;
		const newSubModIds = company.subModuleIds !== undefined
			? Array.from(new Set(company.subModuleIds.map(Number).filter((id) => !isNaN(id) && id > 0)))
			: undefined;

		await this.repo.manager.transaction(async (manager) => {
			// 1. Actualizar los campos del plan
			await manager.update(
				PlansOrmEntity,
				{ id: company.id },
				{
					price: company.price,
					billing_cycle: company.billing_cycle,
					description: company.description,
					max_users: company.max_users,
					max_branches: company.max_branches,
					enabled: company.enabled,
				},
			);

			// 2. Si se proporcionaron módulos o submódulos, actualizar tab_plans_module y sincronizar empresas
			if (newModIds !== undefined || newSubModIds !== undefined) {
				const targetModIds = newModIds ?? [];
				const targetSubModIds = newSubModIds ?? [];

				// Eliminar asignaciones previas del plan
				await manager.query('DELETE FROM tab_plans_module WHERE plans_id = $1', [company.id]);

				// Insertar módulos principales
				for (const modId of targetModIds) {
					await manager.query(
						'INSERT INTO tab_plans_module (plans_id, module_id, sub_module_id) VALUES ($1, $2, NULL)',
						[company.id, modId],
					);
				}

				// Insertar submódulos
				if (targetSubModIds.length > 0) {
					const subModRows = await manager.query(
						'SELECT id, module_id FROM tab_sub_module WHERE id = ANY($1)',
						[targetSubModIds],
					);
					for (const row of subModRows || []) {
						await manager.query(
							'INSERT INTO tab_plans_module (plans_id, module_id, sub_module_id) VALUES ($1, $2, $3)',
							[company.id, row.module_id, row.id],
						);
					}
				}

				// 3. SINCRONIZACIÓN AUTOMÁTICA EN TODAS LAS EMPRESAS CON SUSCRIPCIÓN ACTIVA A ESTE PLAN
				await this.syncPlanChangesToSubscribedCompanies(
					manager,
					company.id!,
					targetModIds,
					targetSubModIds,
				);
			}
		});

		const updated = await this.findById(company.id!);
		return updated!;
	}

	/**
	 * Sincroniza en tiempo real los cambios del plan a todas las empresas asociadas con suscripción activa.
	 * Conserva la integridad de los roles de usuario:
	 * - Elementos eliminados del plan: se remueven de suscripciones y roles.
	 * - Elementos nuevos agregados al plan: se insertan en suscripciones; en roles, el Admin recibe has_access=true y otros roles has_access=false.
	 * - Elementos que continúan en el plan: conservan su asignación y has_access previo sin ser alterados.
	 */
	private async syncPlanChangesToSubscribedCompanies(
		manager: any,
		planId: number,
		planModIds: number[],
		planSubModIds: number[],
	): Promise<void> {
		// 1. Obtener todas las suscripciones activas del plan
		const activeSubs = await manager.query(
			'SELECT id, company_id FROM tab_subscriptions WHERE plan_id = $1 AND enabled = true AND (deleted = false OR deleted IS NULL)',
			[planId],
		);

		if (!activeSubs || activeSubs.length === 0) return;

		const targetModSet = new Set<number>(planModIds);
		const targetSubModSet = new Set<number>(planSubModIds);

		for (const sub of activeSubs) {
			const subId = Number(sub.id);
			const companyId = Number(sub.company_id);

			// A. Obtener módulos y submódulos asignados actualmente en la suscripción
			const existingRows = await manager.query(
				'SELECT id, module_id, sub_module_id FROM tab_subscription_module WHERE subscriptions_id = $1 AND (deleted = false OR deleted IS NULL)',
				[subId],
			);

			const currentModMap = new Map<number, number>(); // modId -> rowId
			const currentSubModMap = new Map<number, number>(); // subModId -> rowId

			for (const r of existingRows || []) {
				if (r.sub_module_id) {
					currentSubModMap.set(Number(r.sub_module_id), Number(r.id));
				} else if (r.module_id) {
					currentModMap.set(Number(r.module_id), Number(r.id));
				}
			}

			// B. Elementos a ELIMINAR de tab_subscription_module
			const subModuleRowIdsToDelete: number[] = [];
			const removedModIds: number[] = [];
			const removedSubModIds: number[] = [];

			for (const [modId, rowId] of currentModMap.entries()) {
				if (!targetModSet.has(modId)) {
					subModuleRowIdsToDelete.push(rowId);
					removedModIds.push(modId);
				}
			}

			for (const [subModId, rowId] of currentSubModMap.entries()) {
				if (!targetSubModSet.has(subModId)) {
					subModuleRowIdsToDelete.push(rowId);
					removedSubModIds.push(subModId);
				}
			}

			if (subModuleRowIdsToDelete.length > 0) {
				await manager.query(
					'DELETE FROM tab_subscription_module WHERE id = ANY($1)',
					[subModuleRowIdsToDelete],
				);
			}

			// C. Elementos a INSERTAR en tab_subscription_module
			const addedModIds: number[] = [];
			const addedSubModIds: number[] = [];

			for (const modId of planModIds) {
				if (!currentModMap.has(modId)) {
					await manager.query(
						'INSERT INTO tab_subscription_module (subscriptions_id, module_id, sub_module_id, enabled, deleted) VALUES ($1, $2, NULL, true, false)',
						[subId, modId],
					);
					addedModIds.push(modId);
				}
			}

			if (planSubModIds.length > 0) {
				const subRows = await manager.query(
					'SELECT id, module_id FROM tab_sub_module WHERE id = ANY($1)',
					[planSubModIds],
				);
				for (const sr of subRows || []) {
					const smId = Number(sr.id);
					if (!currentSubModMap.has(smId)) {
						await manager.query(
							'INSERT INTO tab_subscription_module (subscriptions_id, module_id, sub_module_id, enabled, deleted) VALUES ($1, $2, $3, true, false)',
							[subId, sr.module_id, smId],
						);
						addedSubModIds.push(smId);
					}
				}
			}

			// D. SINCRONIZACIÓN DE ROLES DE LA EMPRESA (tab_role_module)
			// Obtener todos los roles activos de esta empresa
			const companyRoles = await manager.query(
				'SELECT id, is_company_admin, description, code FROM tab_role WHERE company_id = $1 AND (deleted = false OR deleted IS NULL)',
				[companyId],
			);

			if (companyRoles && companyRoles.length > 0) {
				const roleIds = companyRoles.map((r: any) => Number(r.id));

				// 1. Eliminar de TODOS los roles de la empresa los módulos y submódulos que fueron retirados del plan
				if (removedModIds.length > 0) {
					await manager.query(
						'DELETE FROM tab_role_module WHERE role_id = ANY($1) AND module_id = ANY($2) AND sub_module_id IS NULL',
						[roleIds, removedModIds],
					);
				}
				if (removedSubModIds.length > 0) {
					await manager.query(
						'DELETE FROM tab_role_module WHERE role_id = ANY($1) AND sub_module_id = ANY($2)',
						[roleIds, removedSubModIds],
					);
				}

				// 2. Para los elementos NUEVOS agregados al plan:
				// - Si es Administrador: has_access = true
				// - Si son otros roles: has_access = false
				for (const role of companyRoles) {
					const rId = Number(role.id);
					const isAdm = Boolean(role.is_company_admin) ||
						(role.description || '').trim().toLowerCase().startsWith('administrador') ||
						role.code === 'ROL-001';

					for (const modId of addedModIds) {
						// Verificar que no exista ya para evitar duplicados
						const exists = await manager.query(
							'SELECT 1 FROM tab_role_module WHERE role_id = $1 AND module_id = $2 AND sub_module_id IS NULL LIMIT 1',
							[rId, modId],
						);
						if (!exists || exists.length === 0) {
							await manager.query(
								'INSERT INTO tab_role_module (role_id, module_id, sub_module_id, has_access, enabled, deleted) VALUES ($1, $2, NULL, $3, true, false)',
								[rId, modId, isAdm],
							);
						}
					}

					for (const subModId of addedSubModIds) {
						const exists = await manager.query(
							'SELECT 1 FROM tab_role_module WHERE role_id = $1 AND sub_module_id = $2 LIMIT 1',
							[rId, subModId],
						);
						if (!exists || exists.length === 0) {
							await manager.query(
								'INSERT INTO tab_role_module (role_id, module_id, sub_module_id, has_access, enabled, deleted) VALUES ($1, NULL, $2, $3, true, false)',
								[rId, subModId, isAdm],
							);
						}
					}
				}
			}

			// Invalidar caché de permisos para esta empresa inmediatamente
			AccessControlService.clearCache(companyId);
		}
	}

	private toDomain(entity: PlansOrmEntity): Plans {
		return new Plans(
			entity.id,
			entity.price,
			entity.billing_cycle,
			entity.description,
			entity.max_users,
			entity.max_branches,
			entity.enabled,
			entity.created_name,
			entity.createdAt,
		);
	}
}