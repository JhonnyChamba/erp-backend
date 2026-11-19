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
	hasActiveSubscription: boolean;
	subscriptionStatus?: 'active' | 'no_subscription' | 'expired';
	subscriptionMessage?: string;
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
	 * Super admin / developer según la BD (no solo el token, que puede haberse emitido antes de un cambio
	 * de privilegios). Un usuario eliminado o inactivo nunca lo es.
	 */
	async isSuperAdmin(userPayload: any): Promise<boolean> {
		const userId = Number(userPayload?.user_id || 0);
		if (!userId) return false;
		return this.usersRepo.exists({
			where: [
				{ id: userId, deleted: false, enabled: true, super_admin: true },
				{ id: userId, deleted: false, enabled: true, developer: true },
			],
		});
	}

	/** Indica si el rol existe (no eliminado) y pertenece a la empresa indicada. */
	async roleBelongsToCompany(roleId: number, companyId: number): Promise<boolean> {
		const targetRoleId = Number(roleId);
		const targetCompanyId = Number(companyId);
		if (!Number.isInteger(targetRoleId) || targetRoleId <= 0) return false;
		if (!Number.isInteger(targetCompanyId) || targetCompanyId <= 0) return false;
		return this.rolesRepo.exists({
			where: { id: targetRoleId, company: { id: targetCompanyId }, deleted: false },
		});
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

		const now = new Date();
		const validSubs = activeSubs.filter((s) => {
			if (!s.end_date) return true;
			const end = new Date(s.end_date);
			if (isNaN(end.getTime())) return true;
			end.setHours(23, 59, 59, 999);
			return end >= now;
		});

		const hasActiveSubscription = validSubs.length > 0;
		const isExpired = activeSubs.length > 0 && !hasActiveSubscription;
		const subscriptionStatus: 'active' | 'no_subscription' | 'expired' = hasActiveSubscription
			? 'active'
			: isExpired
			? 'expired'
			: 'no_subscription';

		const subscriptionMessage = hasActiveSubscription
			? 'Suscripción activa'
			: isExpired
			? 'La suscripción de la empresa ha expirado.'
			: 'La empresa no cuenta con una suscripción activa.';

		// Si la empresa NO tiene suscripción activa o vigente, NO tiene módulos ni acceso al ERP
		if (!hasActiveSubscription) {
			const noSubResult: UserCompanyAccessResponse = {
				companyId: targetCompanyId,
				isSuperAdmin,
				isMultiCompany,
				hasActiveSubscription: false,
				subscriptionStatus,
				subscriptionMessage,
				roleId: null,
				roleCode: isSuperAdmin ? 'SUPER-ADMIN' : null,
				roleName: isSuperAdmin ? 'Super Admin' : 'Sin Suscripción',
				moduleCodes: [],
				subModuleCodes: [],
				allowedUrls: [],
				menu: [],
			};
			AccessControlService.cache.set(cacheKey, {
				expiresAt: Date.now() + AccessControlService.CACHE_TTL_MS,
				data: noSubResult,
			});
			return noSubResult;
		}

		const subscribedModIds = new Set<number>();
		const subscribedSubModIds = new Set<number>();

		for (const sub of validSubs) {
			for (const sm of sub.subscriptionModules || []) {
				if (!sm.deleted && sm.enabled !== false) {
					if (sm.module?.id) subscribedModIds.add(Number(sm.module.id));
					if (sm.subModule?.id) subscribedSubModIds.add(Number(sm.subModule.id));
				}
			}
		}

		// Determina si un submódulo específico está incluido en la suscripción activa
		const isSubModuleInSubscription = (sm: subModulesOrmEntity): boolean => {
			if (subscribedSubModIds.has(sm.id)) return true;
			const parentId = sm.module?.id ? Number(sm.module.id) : null;
			if (!parentId || !subscribedModIds.has(parentId)) return false;
			// Si la suscripción ya tiene submódulos específicos para este módulo padre,
			// solo los que estén en subscribedSubModIds están autorizados:
			const hasSpecificSubModsForThisMod = allSubModules.some(
				(other) => other.module?.id === parentId && subscribedSubModIds.has(other.id),
			);
			if (hasSpecificSubModsForThisMod) return false;
			// Si el módulo no tiene submódulos explícitos en la suscripción (compatibilidad legacy), se incluye:
			return true;
		};

		// CASO 1: SUPER ADMIN -> Acceso completo a TODOS y ÚNICAMENTE los módulos y submódulos de la suscripción de la empresa activa
		if (isSuperAdmin) {
			const allowedSubMods = allSubModules.filter((sm) => isSubModuleInSubscription(sm));
			const allowedSubModParentIds = new Set<number>(
				allowedSubMods.map((sm) => Number(sm.module?.id)).filter(Boolean),
			);
			const allowedMods = allModules.filter((mod) => {
				const hasCatalogSubmodules = allSubModules.some((sm) => sm.module?.id === mod.id);
				if (hasCatalogSubmodules) {
					return allowedSubModParentIds.has(mod.id);
				}
				// Módulos independientes sin submódulos en catálogo (ej. MOD-007 Reportes)
				return subscribedModIds.has(mod.id);
			});

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

			const allowedUrls = allowedSubMods.map((sm) => sm.url_desc).filter(Boolean);
			for (const mod of allowedMods) {
				if (mod.code === 'MOD-007' && !allowedUrls.includes('/reportes')) {
					allowedUrls.push('/reportes');
				}
			}

			const result: UserCompanyAccessResponse = {
				companyId: targetCompanyId,
				isSuperAdmin: true,
				isMultiCompany: true,
				hasActiveSubscription: true,
				subscriptionStatus: 'active',
				subscriptionMessage: 'Suscripción activa',
				roleId: null,
				roleCode: 'SUPER-ADMIN',
				roleName: 'Super Admin',
				moduleCodes: allowedMods.map((m) => m.code),
				subModuleCodes: allowedSubMods.map((sm) => sm.code),
				allowedUrls,
				menu,
			};

			AccessControlService.cache.set(cacheKey, {
				expiresAt: Date.now() + AccessControlService.CACHE_TTL_MS,
				data: result,
			});
			return result;
		}

		// CASO 2: USUARIO REGULAR O MULTI-EMPRESA -> Resolución de Rol estricta por Empresa
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

		// El rol debe provenir estrictamente de la relación con esta empresa específica (tab_users_company).
		// Solo si targetCompanyId es la empresa principal en la ficha del usuario se toma dbUser.role.id como fallback.
		let assignedRoleId: number | null = null;
		if (userCompany?.role?.id) {
			assignedRoleId = Number(userCompany.role.id);
		} else if (dbUser?.company?.id && Number(dbUser.company.id) === targetCompanyId && dbUser?.role?.id) {
			assignedRoleId = Number(dbUser.role.id);
		}

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
				hasActiveSubscription: true,
				subscriptionStatus: 'active',
				subscriptionMessage: 'Suscripción activa',
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

		const isAdminRole =
			Boolean(roleEntity.is_company_admin) ||
			roleEntity.description?.trim().toLowerCase().startsWith('administrador') ||
			roleEntity.code === 'ROL-001';
		const activeRoleModules = (roleEntity.roleModules || []).filter(
			(rm) => !rm.deleted && rm.enabled !== false && rm.has_access !== false,
		);

		const roleAllowedModIds = new Set<number>();
		const roleAllowedSubModIds = new Set<number>();

		if (isAdminRole) {
			// El Administrador de la empresa tiene acceso a TODOS y ÚNICAMENTE los módulos y submódulos de la suscripción activa
			allSubModules.forEach((sm) => {
				if (isSubModuleInSubscription(sm)) {
					roleAllowedSubModIds.add(sm.id);
					if (sm.module?.id) roleAllowedModIds.add(Number(sm.module.id));
				}
			});
			subscribedModIds.forEach((id) => roleAllowedModIds.add(id));
		} else {
			for (const rm of activeRoleModules) {
				if (rm.module?.id) roleAllowedModIds.add(Number(rm.module.id));
				if (rm.subModule?.id) roleAllowedSubModIds.add(Number(rm.subModule.id));
			}
		}

		// Intersección estricta: solo módulos y submódulos permitidos simultáneamente por la suscripción y el rol
		const effectiveSubModules = allSubModules.filter((sm) => {
			const inSubscription = isSubModuleInSubscription(sm);
			if (!inSubscription) return false;

			if (isAdminRole) return true;

			const parentModId = sm.module?.id ? Number(sm.module.id) : null;
			const inRole =
				roleAllowedSubModIds.has(sm.id) ||
				(roleAllowedSubModIds.size === 0 && parentModId ? roleAllowedModIds.has(parentModId) : false);
			return inRole;
		});

		const effectiveModIdsFromChildren = new Set<number>(
			effectiveSubModules.map((sm) => Number(sm.module?.id)).filter(Boolean),
		);

		const effectiveModules = allModules.filter((mod) => {
			const hasCatalogSubmodules = allSubModules.some((sm) => sm.module?.id === mod.id);
			if (hasCatalogSubmodules) {
				// Solo se incluye si al menos un submódulo fue autorizado para este rol
				return effectiveModIdsFromChildren.has(mod.id);
			}
			// Módulos independientes sin submódulos en catálogo (ej. MOD-007 Reportes)
			const inSubscription = subscribedModIds.has(mod.id);
			const inRole = isAdminRole || roleAllowedModIds.has(mod.id);
			return inSubscription && inRole;
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

		const allowedUrls = effectiveSubModules.map((sm) => sm.url_desc).filter(Boolean);
		for (const mod of effectiveModules) {
			if (mod.code === 'MOD-007' && !allowedUrls.includes('/reportes')) {
				allowedUrls.push('/reportes');
			}
		}

		const result: UserCompanyAccessResponse = {
			companyId: targetCompanyId,
			isSuperAdmin: false,
			isMultiCompany,
			hasActiveSubscription: true,
			subscriptionStatus: 'active',
			subscriptionMessage: 'Suscripción activa',
			roleId: roleEntity.id,
			roleCode: roleEntity.code,
			roleName: roleEntity.description,
			moduleCodes: effectiveModules.map((m) => m.code),
			subModuleCodes: effectiveSubModules.map((sm) => sm.code),
			allowedUrls,
			menu,
		};

		AccessControlService.cache.set(cacheKey, {
			expiresAt: Date.now() + AccessControlService.CACHE_TTL_MS,
			data: result,
		});
		return result;
	}
}
