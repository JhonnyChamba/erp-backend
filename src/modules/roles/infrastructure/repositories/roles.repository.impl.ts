import { RolesRepository } from '../../domain/repositories/roles.repository';
import { RolesOrmEntity, RoleModuleOrmEntity } from '../persistence/roles.orm-entity';
import { SubscriptionsOrmEntity } from 'src/modules/subscriptions/infrastructure/persistence/subscriptions.orm-entity';
import { AccessControlService } from 'src/auth/access-control.service';
import { Roles, RoleAccessDetail } from '../../domain/entities/roles.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

@Injectable()
export class RolesRepositoryImpl implements RolesRepository {

	constructor(
		@InjectRepository(RolesOrmEntity)
		private readonly repo: Repository<RolesOrmEntity>,
		@InjectRepository(RoleModuleOrmEntity)
		private readonly roleModuleRepo: Repository<RoleModuleOrmEntity>,
		@InjectRepository(SubscriptionsOrmEntity)
		private readonly subscriptionsRepo: Repository<SubscriptionsOrmEntity>,
	) { }

	async create(roles: Roles): Promise<Roles> {
		const finalCode = roles.code?.trim()
			? roles.code.trim()
			: await this.generateNextCode(roles.companyId);

		const entity = this.repo.create({
			code: finalCode,
			description: roles.description,
			enabled: roles.enabled,
			company: { id: roles.companyId },
			created_by: roles.createdById,
		});

		const saved = await this.repo.save(entity);

		await this.syncRoleAccess(
			saved.id,
			roles.moduleIds || [],
			roles.subModuleIds || [],
			roles.details,
		);

		const full = await this.findById(saved.id, roles.companyId);
		return full || this.toDomain(saved);
	}

	private async generateNextCode(companyId: number): Promise<string> {
		const all = await this.repo.find({
			where: { company: { id: companyId } },
			select: ['id', 'code'],
			order: { id: 'DESC' },
		});

		if (all.length === 0) {
			return 'ROL-001';
		}

		const last = all[0];
		const match = String(last.code || '').trim().match(/^(.*?)(\d+)$/);

		let prefix = 'ROL-';
		let padLen = 3;
		let nextNum = all.length + 1;

		if (match) {
			prefix = match[1];
			padLen = match[2].length;
			nextNum = parseInt(match[2], 10) + 1;
		}

		const existingCodes = new Set(all.map((r) => String(r.code || '').toUpperCase()));
		let candidate = `${prefix}${String(nextNum).padStart(padLen, '0')}`;
		while (existingCodes.has(candidate.toUpperCase())) {
			nextNum++;
			candidate = `${prefix}${String(nextNum).padStart(padLen, '0')}`;
		}

		return candidate;
	}

	async findByCompany(companyId: number, page: number, limit: number): Promise<{ data: Roles[]; total: number }> {
		let targetCompanyId = Number(companyId);

		// Validar que la empresa exista realmente en tab_company para evitar violaciones de clave foránea
		let validCompany = false;
		if (targetCompanyId && targetCompanyId > 0) {
			const check = await this.repo.manager.query(
				'SELECT id FROM tab_company WHERE id = $1 AND (deleted = false OR deleted IS NULL)',
				[targetCompanyId],
			);
			if (check && check.length > 0) {
				validCompany = true;
			}
		}

		if (!validCompany) {
			const firstComp = await this.repo.manager.query(
				'SELECT id FROM tab_company WHERE (deleted = false OR deleted IS NULL) ORDER BY id ASC LIMIT 1',
			);
			if (firstComp && firstComp.length > 0) {
				targetCompanyId = Number(firstComp[0].id);
				validCompany = true;
			} else {
				return { data: [], total: 0 };
			}
		}

		// Normalizar roles previos cuyo company_id quedó en NULL hacia la empresa activa válida
		await this.repo
			.createQueryBuilder()
			.update(RolesOrmEntity)
			.set({ company: { id: targetCompanyId } as any })
			.where('company_id IS NULL')
			.execute();

		try {
			await this.ensureCompanyAdminRoleSynced(targetCompanyId);
		} catch (syncErr) {
			console.error('Advertencia al sincronizar rol administrador de empresa:', syncErr);
		}

		const [branches, total] = await this.repo.findAndCount({
			where: { company: { id: targetCompanyId }, deleted: false },
			relations: ['company', 'roleModules', 'roleModules.module', 'roleModules.subModule'],
			skip: (page - 1) * limit,
			take: limit,
			order: { id: 'ASC' },
		});

		return {
			data: branches.map(roles => this.toDomain(roles)),
			total,
		};
	}

	private async ensureCompanyAdminRoleSynced(companyId: number): Promise<void> {
		if (!companyId || companyId <= 0) return;
		const compExists = await this.repo.manager.query(
			'SELECT id FROM tab_company WHERE id = $1 AND (deleted = false OR deleted IS NULL)',
			[companyId],
		);
		if (!compExists || compExists.length === 0) return;

		let adminRole = await this.repo
			.createQueryBuilder('r')
			.leftJoinAndSelect('r.roleModules', 'rm', 'rm.deleted = false AND rm.enabled = true')
			.leftJoinAndSelect('rm.module', 'mod')
			.leftJoinAndSelect('rm.subModule', 'subMod')
			.where('r.company_id = :companyId', { companyId })
			.andWhere('r.deleted = false')
			.andWhere('LOWER(r.description) LIKE :desc', { desc: 'administrador%' })
			.getOne();

		if (!adminRole) {
			const nextCode = await this.generateNextCode(companyId);
			adminRole = await this.repo.save(
				this.repo.create({
					code: nextCode,
					description: 'Administrador',
					enabled: true,
					deleted: false,
					company: { id: companyId } as any,
				}),
			);
			adminRole.roleModules = [];
		}

		// Obtener los módulos y submódulos activos de la suscripción de la empresa
		const activeSubs = await this.subscriptionsRepo.find({
			where: { company: { id: companyId }, deleted: false, enabled: true },
			relations: ['subscriptionModules', 'subscriptionModules.module', 'subscriptionModules.subModule'],
		});

		const subModIds = new Set<number>();
		const modIds = new Set<number>();
		for (const sub of activeSubs) {
			for (const sm of sub.subscriptionModules || []) {
				if (!sm.deleted && sm.enabled !== false) {
					if (sm.module?.id) modIds.add(Number(sm.module.id));
					if (sm.subModule?.id) subModIds.add(Number(sm.subModule.id));
				}
			}
		}

		// Si el rol Administrador aún no tiene sincronizados todos los accesos de la suscripción, sincronizarlo
		const currentActive = (adminRole.roleModules || []).filter((rm) => !rm.deleted && rm.enabled !== false && rm.has_access);
		const currentModSet = new Set(currentActive.filter((rm) => rm.module?.id || (rm as any).module_id).map((rm) => Number(rm.module?.id || (rm as any).module_id)));
		const currentSubModSet = new Set(currentActive.filter((rm) => rm.subModule?.id || (rm as any).sub_module_id).map((rm) => Number(rm.subModule?.id || (rm as any).sub_module_id)));

		const needsSync =
			(modIds.size > 0 || subModIds.size > 0) &&
			(currentActive.length === 0 ||
				Array.from(modIds).some((id) => !currentModSet.has(id)) ||
				Array.from(subModIds).some((id) => !currentSubModSet.has(id)));

		if (needsSync) {
			await this.syncRoleAccess(
				adminRole.id,
				Array.from(modIds),
				Array.from(subModIds),
			);
		}
	}

	async findById(id: number, companyId?: number): Promise<Roles | null> {
		let roles = await this.repo.findOne({
			where: { id, deleted: false },
			relations: ['company', 'roleModules', 'roleModules.module', 'roleModules.subModule'],
		});

		if (roles && !roles.company && companyId) {
			await this.repo.update({ id }, { company: { id: companyId } as any });
			roles.company = { id: companyId } as any;
		}

		return roles ? this.toDomain(roles) : null;
	}

	async update(roles: Roles): Promise<Roles> {
		const updatePayload: any = {
			code: roles.code,
			description: roles.description,
			enabled: roles.enabled,
		};
		if (roles.companyId) {
			updatePayload.company = { id: roles.companyId };
		}

		await this.repo.update({ id: roles.id! }, updatePayload);

		if (
			roles.moduleIds !== undefined ||
			roles.subModuleIds !== undefined ||
			roles.details !== undefined
		) {
			await this.syncRoleAccess(
				roles.id!,
				roles.moduleIds || [],
				roles.subModuleIds || [],
				roles.details,
			);
		}

		const updated = await this.findById(roles.id!, roles.companyId);
		return updated!;
	}

	private async syncRoleAccess(
		roleId: number,
		moduleIds: number[],
		subModuleIds: number[],
		details?: RoleAccessDetail[],
	): Promise<void> {
		AccessControlService.clearCache();
		await this.roleModuleRepo
			.createQueryBuilder()
			.update(RoleModuleOrmEntity)
			.set({ deleted: true, enabled: false })
			.where('role_id = :roleId', { roleId })
			.execute();

		if (Array.isArray(details) && details.length > 0) {
			for (const item of details) {
				const entity = this.roleModuleRepo.create({
					role: { id: roleId } as any,
					module: item.moduleId ? ({ id: Number(item.moduleId) } as any) : null,
					subModule: item.subModuleId ? ({ id: Number(item.subModuleId) } as any) : null,
					has_access: Boolean(item.hasAccess),
					enabled: true,
					deleted: false,
				});
				await this.roleModuleRepo.save(entity);
			}
			return;
		}

		const targetModIds = Array.from(
			new Set((moduleIds || []).map(Number).filter((id) => !isNaN(id) && id > 0)),
		);
		const targetSubModIds = Array.from(
			new Set((subModuleIds || []).map(Number).filter((id) => !isNaN(id) && id > 0)),
		);

		for (const modId of targetModIds) {
			const entity = this.roleModuleRepo.create({
				role: { id: roleId } as any,
				module: { id: modId } as any,
				subModule: null as any,
				has_access: true,
				enabled: true,
				deleted: false,
			});
			await this.roleModuleRepo.save(entity);
		}

		for (const subModId of targetSubModIds) {
			const entity = this.roleModuleRepo.create({
				role: { id: roleId } as any,
				module: null as any,
				subModule: { id: subModId } as any,
				has_access: true,
				enabled: true,
				deleted: false,
			});
			await this.roleModuleRepo.save(entity);
		}
	}

	private toDomain(entity: RolesOrmEntity): Roles {
		const activeItems = (entity.roleModules || []).filter(
			(rm) => !rm.deleted && rm.enabled !== false,
		);

		const moduleIds = Array.from(
			new Set(
				activeItems
					.filter((rm) => rm.module?.id && rm.has_access !== false)
					.map((rm) => Number(rm.module.id)),
			),
		);

		const subModuleIds = Array.from(
			new Set(
				activeItems
					.filter((rm) => rm.subModule?.id && rm.has_access !== false)
					.map((rm) => Number(rm.subModule.id)),
			),
		);

		const details: RoleAccessDetail[] = activeItems.map((rm) => ({
			moduleId: rm.module?.id ? Number(rm.module.id) : null,
			subModuleId: rm.subModule?.id ? Number(rm.subModule.id) : null,
			hasAccess: rm.has_access !== false,
		}));

		return new Roles(
			entity.id,
			entity.code,
			entity.description,
			entity.company?.id,
			entity.enabled,
			entity.created_at,
			entity.created_by,
			moduleIds,
			subModuleIds,
			details,
		);
	}
}