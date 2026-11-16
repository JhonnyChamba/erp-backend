"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AccessControlService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccessControlService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const module_orm_entity_1 = require("../modules/module/infrastructure/persistence/module.orm-entity");
const sub_module_orm_entity_1 = require("../modules/sub-module/infrastructure/persistence/sub-module.orm-entity");
const subscriptions_orm_entity_1 = require("../modules/subscriptions/infrastructure/persistence/subscriptions.orm-entity");
const roles_orm_entity_1 = require("../modules/roles/infrastructure/persistence/roles.orm-entity");
const user_company_orm_entity_1 = require("../modules/user-company/infrastructure/persistence/user-company.orm-entity");
const users_orm_entity_1 = require("../modules/users/infrastructure/persistence/users.orm-entity");
let AccessControlService = class AccessControlService {
    static { AccessControlService_1 = this; }
    moduleRepo;
    subModuleRepo;
    subscriptionsRepo;
    rolesRepo;
    roleModuleRepo;
    userCompanyRepo;
    usersRepo;
    static cache = new Map();
    static CACHE_TTL_MS = 15_000;
    static membershipCache = new Map();
    constructor(moduleRepo, subModuleRepo, subscriptionsRepo, rolesRepo, roleModuleRepo, userCompanyRepo, usersRepo) {
        this.moduleRepo = moduleRepo;
        this.subModuleRepo = subModuleRepo;
        this.subscriptionsRepo = subscriptionsRepo;
        this.rolesRepo = rolesRepo;
        this.roleModuleRepo = roleModuleRepo;
        this.userCompanyRepo = userCompanyRepo;
        this.usersRepo = usersRepo;
    }
    static clearCache(companyId, userId) {
        AccessControlService_1.membershipCache.clear();
        if (!companyId && !userId) {
            AccessControlService_1.cache.clear();
            return;
        }
        for (const key of AccessControlService_1.cache.keys()) {
            const [uStr, cStr] = key.split(':');
            if ((userId && Number(uStr) === Number(userId)) || (companyId && Number(cStr) === Number(companyId))) {
                AccessControlService_1.cache.delete(key);
            }
        }
    }
    async getAccessibleCompanyIds(userPayload) {
        const userId = Number(userPayload?.user_id || 0);
        if (!userId)
            return [];
        const dbUser = await this.usersRepo.findOne({ where: { id: userId, deleted: false, enabled: true }, relations: ['company'] });
        if (!dbUser)
            return [];
        if (dbUser.super_admin || dbUser.developer)
            return null;
        const links = await this.userCompanyRepo.find({ where: { user: { id: userId }, deleted: false, enabled: true }, relations: ['company'] });
        const ids = new Set();
        if (dbUser.company?.id)
            ids.add(Number(dbUser.company.id));
        for (const l of links)
            if (l.company?.id)
                ids.add(Number(l.company.id));
        return [...ids];
    }
    async canAccessCompany(userPayload, companyId) {
        const userId = Number(userPayload?.user_id || 0);
        const targetCompanyId = Number(companyId);
        if (!userId || !Number.isInteger(targetCompanyId) || targetCompanyId <= 0)
            return false;
        const cacheKey = `${userId}:${targetCompanyId}`;
        const cached = AccessControlService_1.membershipCache.get(cacheKey);
        if (cached && cached.expiresAt > Date.now())
            return cached.allowed;
        const dbUser = await this.usersRepo.findOne({ where: { id: userId, deleted: false, enabled: true }, relations: ['company'] });
        let allowed = false;
        if (dbUser) {
            if (dbUser.super_admin || dbUser.developer || Number(dbUser.company?.id) === targetCompanyId) {
                allowed = true;
            }
            else {
                allowed = await this.userCompanyRepo.exist({
                    where: { user: { id: userId }, company: { id: targetCompanyId }, deleted: false, enabled: true },
                });
            }
        }
        AccessControlService_1.membershipCache.set(cacheKey, { expiresAt: Date.now() + AccessControlService_1.CACHE_TTL_MS, allowed });
        return allowed;
    }
    async getUserCompanyAccess(userPayload, companyId, forceRefresh = false) {
        const userId = Number(userPayload?.user_id || 0);
        const targetCompanyId = Number(companyId || userPayload?.company_id || 1);
        const cacheKey = `${userId}:${targetCompanyId}`;
        if (!forceRefresh) {
            const cached = AccessControlService_1.cache.get(cacheKey);
            if (cached && cached.expiresAt > Date.now()) {
                return cached.data;
            }
        }
        const dbUser = userId
            ? await this.usersRepo.findOne({
                where: { id: userId, deleted: false },
                relations: ['role', 'company'],
            })
            : null;
        const isSuperAdmin = Boolean(dbUser ? dbUser.super_admin || dbUser.developer : userPayload?.super_admin || userPayload?.developer);
        const isMultiCompany = Boolean(dbUser ? dbUser.multi_company : userPayload?.multi_company);
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
        const activeSubs = await this.subscriptionsRepo.find({
            where: { company: { id: targetCompanyId }, deleted: false, enabled: true },
            relations: ['subscriptionModules', 'subscriptionModules.module', 'subscriptionModules.subModule'],
        });
        const now = new Date();
        const validSubs = activeSubs.filter((s) => {
            if (!s.end_date)
                return true;
            const end = new Date(s.end_date);
            if (isNaN(end.getTime()))
                return true;
            end.setHours(23, 59, 59, 999);
            return end >= now;
        });
        const hasActiveSubscription = validSubs.length > 0;
        const isExpired = activeSubs.length > 0 && !hasActiveSubscription;
        const subscriptionStatus = hasActiveSubscription
            ? 'active'
            : isExpired
                ? 'expired'
                : 'no_subscription';
        const subscriptionMessage = hasActiveSubscription
            ? 'Suscripción activa'
            : isExpired
                ? 'La suscripción de la empresa ha expirado.'
                : 'La empresa no cuenta con una suscripción activa.';
        if (!hasActiveSubscription) {
            const noSubResult = {
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
            AccessControlService_1.cache.set(cacheKey, {
                expiresAt: Date.now() + AccessControlService_1.CACHE_TTL_MS,
                data: noSubResult,
            });
            return noSubResult;
        }
        const subscribedModIds = new Set();
        const subscribedSubModIds = new Set();
        for (const sub of validSubs) {
            for (const sm of sub.subscriptionModules || []) {
                if (!sm.deleted && sm.enabled !== false) {
                    if (sm.module?.id)
                        subscribedModIds.add(Number(sm.module.id));
                    if (sm.subModule?.id)
                        subscribedSubModIds.add(Number(sm.subModule.id));
                }
            }
        }
        const isSubModuleInSubscription = (sm) => {
            if (subscribedSubModIds.has(sm.id))
                return true;
            const parentId = sm.module?.id ? Number(sm.module.id) : null;
            if (!parentId || !subscribedModIds.has(parentId))
                return false;
            const hasSpecificSubModsForThisMod = allSubModules.some((other) => other.module?.id === parentId && subscribedSubModIds.has(other.id));
            if (hasSpecificSubModsForThisMod)
                return false;
            return true;
        };
        if (isSuperAdmin) {
            const allowedSubMods = allSubModules.filter((sm) => isSubModuleInSubscription(sm));
            const allowedSubModParentIds = new Set(allowedSubMods.map((sm) => Number(sm.module?.id)).filter(Boolean));
            const allowedMods = allModules.filter((mod) => {
                const hasCatalogSubmodules = allSubModules.some((sm) => sm.module?.id === mod.id);
                if (hasCatalogSubmodules) {
                    return allowedSubModParentIds.has(mod.id);
                }
                return subscribedModIds.has(mod.id);
            });
            const menu = allowedMods.map((mod) => ({
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
            const result = {
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
            AccessControlService_1.cache.set(cacheKey, {
                expiresAt: Date.now() + AccessControlService_1.CACHE_TTL_MS,
                data: result,
            });
            return result;
        }
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
        let assignedRoleId = null;
        if (userCompany?.role?.id) {
            assignedRoleId = Number(userCompany.role.id);
        }
        else if (dbUser?.company?.id && Number(dbUser.company.id) === targetCompanyId && dbUser?.role?.id) {
            assignedRoleId = Number(dbUser.role.id);
        }
        let roleEntity = null;
        if (assignedRoleId) {
            roleEntity = await this.rolesRepo.findOne({
                where: { id: assignedRoleId, deleted: false, enabled: true },
                relations: ['roleModules', 'roleModules.module', 'roleModules.subModule'],
            });
        }
        if (!roleEntity) {
            const emptyResult = {
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
            AccessControlService_1.cache.set(cacheKey, {
                expiresAt: Date.now() + AccessControlService_1.CACHE_TTL_MS,
                data: emptyResult,
            });
            return emptyResult;
        }
        const isAdminRole = Boolean(roleEntity.is_company_admin) ||
            roleEntity.description?.trim().toLowerCase().startsWith('administrador') ||
            roleEntity.code === 'ROL-001';
        const activeRoleModules = (roleEntity.roleModules || []).filter((rm) => !rm.deleted && rm.enabled !== false && rm.has_access !== false);
        const roleAllowedModIds = new Set();
        const roleAllowedSubModIds = new Set();
        if (isAdminRole) {
            allSubModules.forEach((sm) => {
                if (isSubModuleInSubscription(sm)) {
                    roleAllowedSubModIds.add(sm.id);
                    if (sm.module?.id)
                        roleAllowedModIds.add(Number(sm.module.id));
                }
            });
            subscribedModIds.forEach((id) => roleAllowedModIds.add(id));
        }
        else {
            for (const rm of activeRoleModules) {
                if (rm.module?.id)
                    roleAllowedModIds.add(Number(rm.module.id));
                if (rm.subModule?.id)
                    roleAllowedSubModIds.add(Number(rm.subModule.id));
            }
        }
        const effectiveSubModules = allSubModules.filter((sm) => {
            const inSubscription = isSubModuleInSubscription(sm);
            if (!inSubscription)
                return false;
            if (isAdminRole)
                return true;
            const parentModId = sm.module?.id ? Number(sm.module.id) : null;
            const inRole = roleAllowedSubModIds.has(sm.id) ||
                (roleAllowedSubModIds.size === 0 && parentModId ? roleAllowedModIds.has(parentModId) : false);
            return inRole;
        });
        const effectiveModIdsFromChildren = new Set(effectiveSubModules.map((sm) => Number(sm.module?.id)).filter(Boolean));
        const effectiveModules = allModules.filter((mod) => {
            const hasCatalogSubmodules = allSubModules.some((sm) => sm.module?.id === mod.id);
            if (hasCatalogSubmodules) {
                return effectiveModIdsFromChildren.has(mod.id);
            }
            const inSubscription = subscribedModIds.has(mod.id);
            const inRole = isAdminRole || roleAllowedModIds.has(mod.id);
            return inSubscription && inRole;
        });
        const menu = effectiveModules.map((mod) => ({
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
        const result = {
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
        AccessControlService_1.cache.set(cacheKey, {
            expiresAt: Date.now() + AccessControlService_1.CACHE_TTL_MS,
            data: result,
        });
        return result;
    }
};
exports.AccessControlService = AccessControlService;
exports.AccessControlService = AccessControlService = AccessControlService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(module_orm_entity_1.ModuleOrmEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(sub_module_orm_entity_1.subModulesOrmEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(subscriptions_orm_entity_1.SubscriptionsOrmEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(roles_orm_entity_1.RolesOrmEntity)),
    __param(4, (0, typeorm_1.InjectRepository)(roles_orm_entity_1.RoleModuleOrmEntity)),
    __param(5, (0, typeorm_1.InjectRepository)(user_company_orm_entity_1.UserCompanyOrmEntity)),
    __param(6, (0, typeorm_1.InjectRepository)(users_orm_entity_1.UsersOrmEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AccessControlService);
//# sourceMappingURL=access-control.service.js.map