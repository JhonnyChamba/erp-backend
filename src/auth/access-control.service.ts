import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ModuleOrmEntity } from 'src/modules/module/infrastructure/persistence/module.orm-entity';
import { subModulesOrmEntity } from 'src/modules/sub-module/infrastructure/persistence/sub-module.orm-entity';
import { SubscriptionsOrmEntity } from 'src/modules/subscriptions/infrastructure/persistence/subscriptions.orm-entity';
import { RolesOrmEntity, RoleModuleOrmEntity } from 'src/modules/roles/infrastructure/persistence/roles.orm-entity';
import { UserCompanyOrmEntity } from 'src/modules/user-company/infrastructure/persistence/user-company.orm-entity';
import { UsersOrmEntity } from 'src/modules/users/infrastructure/persistence/users.orm-entity';

export interface MenuSubModuleItem {
	id: number;
	code: string;
	description: string;
	icon: string;
	url: string;
}

export interface MenuModuleItem {
	id: number;
	code: string;
	description: string;
	icon: string;
	children: MenuSubModuleItem[];
}

export interface UserCompanyAccessResponse {
	companyId: number;
	isSuperAdmin: boolean;
	isMultiCompany: boolean;
	roleId: number | null;
	roleCode: string | null;
	roleName: string | null;
	moduleCodes: string[];
	subModuleCodes: string[];
	allowedUrls: string[];
	menu: MenuModuleItem[];
}

@Injectable()
export class AccessControlService {
	// Caché ligera en memoria por (userId:companyId) para no sobrecargar el token ni la base de datos
	private static cache = new Map<string, { expiresAt: number; data: UserCompanyAccessResponse }>();
	private static readonly CACHE_TTL_MS = 15_000; // 15 segundos
	private static membershipCache = new Map<string, { expiresAt: number; allowed: boolean }>();

	constructor(
		@InjectRepository(ModuleOrmEntity)
		private readonly moduleRepo: Repository<ModuleOrmEntity>,
		@InjectRepository(subModulesOrmEntity)
		private readonly subModuleRepo: Repository<subModulesOrmEntity>,
		@InjectRepository(SubscriptionsOrmEntity)
		private readonly subscriptionsRepo: Repository<SubscriptionsOrmEntity>,
		@InjectRepository(RolesOrmEntity)
		private readonly rolesRepo: Repository<RolesOrmEntity>,
		@InjectRepository(RoleModuleOrmEntity)
		private readonly roleModuleRepo: Repository<RoleModuleOrmEntity>,
		@InjectRepository(UserCompanyOrmEntity)
		private readonly userCompanyRepo: Repository<UserCompanyOrmEntity>,
		@InjectRepository(UsersOrmEntity)
		private readonly usersRepo: Repository<UsersOrmEntity>,
	) {}

	static clearCache(companyId?: number, userId?: number) {
		AccessControlService.membershipCache.clear();
		if (!companyId && !userId) {
			AccessControlService.cache.clear();
			return;
		}
		for (const key of AccessControlService.cache.keys()) {
			const [uStr, cStr] = key.split(':');
			if ((userId && Number(uStr) === Number(userId)) || (companyId && Number(cStr) === Number(companyId))) {
				AccessControlService.cache.delete(key);
			}
		}
	}

	/** Ids de empresas a las que pertenece el usuario. null = todas (super admin / developer). */
	async getAccessibleCompanyIds(userPayload: any): Promise<number[] | null> {
		const userId = Number(userPayload?.user_id || 0);
		if (!userId) return [];
		const dbUser = await this.usersRepo.findOne({ where: { id: userId, deleted: false, enabled: true }, relations: ['company'] });
		if (!dbUser) return [];
		if (dbUser.super_admin || dbUser.developer) return null;
		const links = await this.userCompanyRepo.find({ where: { user: { id: userId }, deleted: false, enabled: true }, relations: ['company'] });
		const ids = new Set<number>();
		if (dbUser.company?.id) ids.add(Number(dbUser.company.id));
		for (const l of links) if (l.company?.id) ids.add(Number(l.company.id));
		return [...ids];
	}

	/**
	 * Indica si el usuario puede operar sobre la empresa indicada: super admin / developer, empresa propia
	 * (la asignada en su ficha) o una empresa en la que tenga una relación usuario-empresa activa.
	 * Se consulta la BD (no solo el token) para respetar cambios posteriores a la emisión del token.
	 */
	async canAccessCompany(userPayload: any, companyId: number): Promise<boolean> {
		const userId = Number(userPayload?.user_id || 0);
		const targetCompanyId = Number(companyId);
		if (!userId || !Number.isInteger(targetCompanyId) || targetCompanyId <= 0) return false;

		const cacheKey = `${userId}:${targetCompanyId}`;
		const cached = AccessControlService.membershipCache.get(cacheKey);
		if (cached && cached.expiresAt > Date.now()) return cached.allowed;

		const dbUser = await this.usersRepo.findOne({ where: { id: userId, deleted: false, enabled: true }, relations: ['company'] });
		let allowed = false;
		if (dbUser) {
			if (dbUser.super_admin || dbUser.developer || Number(dbUser.company?.id) === targetCompanyId) {
				allowed = true;
			} else {
				allowed = await this.userCompanyRepo.exist({
					where: { user: { id: userId }, company: { id: targetCompanyId }, deleted: false, enabled: true },
				});
			}
		}

		AccessControlService.membershipCache.set(cacheKey, { expiresAt: Date.now() + AccessControlService.CACHE_TTL_MS, allowed });
		return allowed;
	}

	async getUserCompanyAccess(
		userPayload: any,
		companyId: number,
		forceRefresh = false,
	): Promise<UserCompanyAccessResponse> {
		const userId = Number(userPayload?.user_id || 0);
		const targetCompanyId = Number(companyId || userPayload?.company_id || 1);
		const cacheKey = `${userId}:${targetCompanyId}`;

		if (!forceRefresh) {
			const cached = AccessControlService.cache.get(cacheKey);
			if (cached && cached.expiresAt > Date.now()) {
				return cached.data;
			}
		}

		// 1. Verificar usuario actual en BD por si cambió su flag de super_admin o multi_company después de emitir el token
		const dbUser = userId
			? await this.usersRepo.findOne({
					where: { id: userId, deleted: false },
					relations: ['role', 'company'],
				})
			: null;

		const isSuperAdmin = Boolean(
			dbUser ? dbUser.super_admin || dbUser.developer : userPayload?.super_admin || userPayload?.developer,
		);
		const isMultiCompany = Boolean(
			dbUser ? dbUser.multi_company : userPayload?.multi_company,
		);

		// 2. Cargar catálogo activo de Módulos y Submódulos ordenado por orden de menú y ID
		const [allModules, allSubModules] = await Promise.all([
			this.moduleRepo.find({
				where: { deleted: false, enabled: true },
				order: { order_index: 'ASC', id: 'ASC' },
			}),
			this.subModuleRepo.find({
				where: { deleted: false, enabled: true },
				relations: ['module'],
				order: { order_index: 'ASC', id: 'ASC' },
			}),
		]);

		// Consultar la suscripción activa de la empresa para determinar los módulos contratados
		const activeSubs = await this.subscriptionsRepo.find({
			where: { company: { id: targetCompanyId }, deleted: false, enabled: true },
			relations: ['subscriptionModules', 'subscriptionModules.module', 'subscriptionModules.subModule'],
		});

		const subscribedModIds = new Set<number>();
		const subscribedSubModIds = new Set<number>();

		for (const sub of activeSubs) {
			for (const sm of sub.subscriptionModules || []) {
				if (!sm.deleted && sm.enabled !== false) {
					if (sm.module?.id) subscribedModIds.add(Number(sm.module.id));
					if (sm.subModule?.id) subscribedSubModIds.add(Number(sm.subModule.id));
				}
			}
		}

		const hasSubscriptionRestriction = subscribedModIds.size > 0 || subscribedSubModIds.size > 0;

		// CASO 1: SUPER ADMIN -> Acceso a todos los módulos contratados en la suscripción de la empresa activa
		if (isSuperAdmin) {
			const allowedMods = hasSubscriptionRestriction
				? allModules.filter((m) => subscribedModIds.has(m.id))
				: allModules;
			const allowedSubMods = hasSubscriptionRestriction
				? allSubModules.filter(
						(sm) =>
							subscribedSubModIds.has(sm.id) ||
							(sm.module?.id && subscribedModIds.has(Number(sm.module.id))),
				  )
				: allSubModules;

			const menu: MenuModuleItem[] = allowedMods.map((mod) => ({
				id: mod.id,
				code: mod.code,
				description: mod.description,
				icon: mod.desc_icon || 'solar:widget-4-line-duotone',
				children: allowedSubMods
					.filter((sm) => sm.module?.id === mod.id)
					.map((sm) => ({
						id: sm.id,
						code: sm.code,
						description: sm.description,
						icon: sm.desc_icon || 'solar:round-alt-arrow-right-line-duotone',
						url: sm.url_desc || '/',
					})),
			}));

			const result: UserCompanyAccessResponse = {
				companyId: targetCompanyId,
				isSuperAdmin: true,
				isMultiCompany: true,
				roleId: null,
				roleCode: 'SUPER-ADMIN',
				roleName: 'Super Admin',
				moduleCodes: allowedMods.map((m) => m.code),
				subModuleCodes: allowedSubMods.map((sm) => sm.code),
				allowedUrls: allowedSubMods.map((sm) => sm.url_desc).filter(Boolean),
				menu,
			};

			AccessControlService.cache.set(cacheKey, {
				expiresAt: Date.now() + AccessControlService.CACHE_TTL_MS,
				data: result,
			});
			return result;
		}

		// Buscar la relación usuario-empresa para obtener el rol específico en esta empresa
		const userCompany = userId
			? await this.userCompanyRepo.findOne({
					where: {
						user: { id: userId },
						company: { id: targetCompanyId },
						deleted: false,
						enabled: true,
					},
					relations: ['role'],
				})
			: null;

		const assignedRoleId: number | null =
			userCompany?.role?.id ||
			(dbUser?.role?.id ? Number(dbUser.role.id) : null);

		let roleEntity: RolesOrmEntity | null = null;
		if (assignedRoleId) {
			roleEntity = await this.rolesRepo.findOne({
				where: { id: assignedRoleId, deleted: false, enabled: true },
				relations: ['roleModules', 'roleModules.module', 'roleModules.subModule'],
			});
		}

		if (!roleEntity) {
			const emptyResult: UserCompanyAccessResponse = {
				companyId: targetCompanyId,
				isSuperAdmin: false,
				isMultiCompany,
				roleId: null,
				roleCode: null,
				roleName: 'Sin Rol Asignado',
				moduleCodes: [],
				subModuleCodes: [],
				allowedUrls: [],
				menu: [],
			};
			AccessControlService.cache.set(cacheKey, {
				expiresAt: Date.now() + AccessControlService.CACHE_TTL_MS,
				data: emptyResult,
			});
			return emptyResult;
		}

		const isAdminRole = roleEntity.description?.trim().toLowerCase().startsWith('administrador');
		const activeRoleModules = (roleEntity.roleModules || []).filter(
			(rm) => !rm.deleted && rm.enabled !== false && rm.has_access !== false,
		);

		const roleAllowedModIds = new Set<number>();
		const roleAllowedSubModIds = new Set<number>();

		if (isAdminRole && activeRoleModules.length === 0) {
			// Si es el rol Administrador de la empresa y aún no tiene detalle personalizado, hereda toda la suscripción (o todo el catálogo si no hay restricción de suscripción)
			if (hasSubscriptionRestriction) {
				subscribedModIds.forEach((id) => roleAllowedModIds.add(id));
				subscribedSubModIds.forEach((id) => roleAllowedSubModIds.add(id));
			} else {
				allModules.forEach((m) => roleAllowedModIds.add(m.id));
				allSubModules.forEach((sm) => roleAllowedSubModIds.add(sm.id));
			}
		} else {
			for (const rm of activeRoleModules) {
				if (rm.module?.id) roleAllowedModIds.add(Number(rm.module.id));
				if (rm.subModule?.id) roleAllowedSubModIds.add(Number(rm.subModule.id));
			}
		}

		// Intersección efectiva: si la empresa tiene suscripción con módulos específicos, validar ambos; si no, validar por el rol asignado
		const effectiveSubModules = allSubModules.filter((sm) => {
			const parentModId = sm.module?.id;
			const inSubscription = !hasSubscriptionRestriction
				? true
				: subscribedSubModIds.has(sm.id) ||
					(subscribedSubModIds.size === 0 && parentModId ? subscribedModIds.has(parentModId) : false);
			const inRole =
				roleAllowedSubModIds.has(sm.id) ||
				(roleAllowedSubModIds.size === 0 && parentModId ? roleAllowedModIds.has(parentModId) : false);
			return inSubscription && inRole;
		});

		const effectiveModIdsFromChildren = new Set<number>(
			effectiveSubModules.map((sm) => Number(sm.module?.id)).filter(Boolean),
		);

		const effectiveModules = allModules.filter((mod) => {
			const inSubscription = !hasSubscriptionRestriction
				? true
				: subscribedModIds.has(mod.id) || effectiveModIdsFromChildren.has(mod.id);
			const inRole = roleAllowedModIds.has(mod.id) || effectiveModIdsFromChildren.has(mod.id);
			return inSubscription && inRole && effectiveModIdsFromChildren.has(mod.id);
		});

		const menu: MenuModuleItem[] = effectiveModules.map((mod) => ({
			id: mod.id,
			code: mod.code,
			description: mod.description,
			icon: mod.desc_icon || 'solar:widget-4-line-duotone',
			children: effectiveSubModules
				.filter((sm) => sm.module?.id === mod.id)
				.map((sm) => ({
					id: sm.id,
					code: sm.code,
					description: sm.description,
					icon: sm.desc_icon || 'solar:round-alt-arrow-right-line-duotone',
					url: sm.url_desc || '/',
				})),
		}));

		const result: UserCompanyAccessResponse = {
			companyId: targetCompanyId,
			isSuperAdmin: false,
			isMultiCompany,
			roleId: roleEntity.id,
			roleCode: roleEntity.code,
			roleName: roleEntity.description,
			moduleCodes: effectiveModules.map((m) => m.code),
			subModuleCodes: effectiveSubModules.map((sm) => sm.code),
			allowedUrls: effectiveSubModules.map((sm) => sm.url_desc).filter(Boolean),
			menu,
		};

		AccessControlService.cache.set(cacheKey, {
			expiresAt: Date.now() + AccessControlService.CACHE_TTL_MS,
			data: result,
		});
		return result;
	}
}
