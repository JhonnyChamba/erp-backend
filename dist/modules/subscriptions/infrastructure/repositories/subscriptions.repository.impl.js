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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionsRepositoryImpl = void 0;
const subscriptions_orm_entity_1 = require("../persistence/subscriptions.orm-entity");
const subscriptions_module_orm_entity_1 = require("../../../subscriptions-module/infrastructure/persistence/subscriptions-module.orm-entity");
const roles_orm_entity_1 = require("../../../roles/infrastructure/persistence/roles.orm-entity");
const access_control_service_1 = require("../../../../auth/access-control.service");
const subscriptions_entity_1 = require("../../domain/entities/subscriptions.entity");
const typeorm_1 = require("@nestjs/typeorm");
const common_1 = require("@nestjs/common");
const typeorm_2 = require("typeorm");
let SubscriptionsRepositoryImpl = class SubscriptionsRepositoryImpl {
    repo;
    subModuleRepo;
    rolesRepo;
    roleModuleRepo;
    constructor(repo, subModuleRepo, rolesRepo, roleModuleRepo) {
        this.repo = repo;
        this.subModuleRepo = subModuleRepo;
        this.rolesRepo = rolesRepo;
        this.roleModuleRepo = roleModuleRepo;
    }
    async create(subscriptions) {
        if (subscriptions.companyId) {
            await this.repo
                .createQueryBuilder()
                .update(subscriptions_orm_entity_1.SubscriptionsOrmEntity)
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
        if (subscriptions.planId && (targetModIds.length === 0 || targetSubModIds.length === 0)) {
            const planPms = await this.repo.manager.query('SELECT module_id, sub_module_id FROM tab_plans_module WHERE plans_id = $1', [subscriptions.planId]);
            if (planPms && planPms.length > 0) {
                const pModIds = [];
                const pSubModIds = [];
                for (const r of planPms) {
                    if (r.sub_module_id)
                        pSubModIds.push(Number(r.sub_module_id));
                    else if (r.module_id)
                        pModIds.push(Number(r.module_id));
                }
                if (targetModIds.length === 0)
                    targetModIds = Array.from(new Set(pModIds));
                if (targetSubModIds.length === 0)
                    targetSubModIds = Array.from(new Set(pSubModIds));
            }
        }
        if (targetModIds.length === 0) {
            const allActiveMods = await this.repo.manager.query('SELECT id FROM tab_module WHERE enabled = true AND (deleted = false OR deleted IS NULL) ORDER BY id ASC');
            targetModIds = (allActiveMods || []).map((m) => Number(m.id));
            const allActiveSubMods = await this.repo.manager.query('SELECT id FROM tab_sub_module WHERE enabled = true AND (deleted = false OR deleted IS NULL) ORDER BY id ASC');
            targetSubModIds = (allActiveSubMods || []).map((sm) => Number(sm.id));
        }
        await this.syncSubscriptionAccess(saved.id, targetModIds, targetSubModIds, subscriptions.companyId);
        const full = await this.findById(saved.id, subscriptions.companyId);
        return full || this.toDomain(saved);
    }
    async findByCompany(companyId, page, limit) {
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
    async findById(id, companyId) {
        const whereClause = { id, deleted: false };
        if (companyId) {
            whereClause.company = { id: companyId };
        }
        const subscriptions = await this.repo.findOne({
            where: whereClause,
            relations: ['plan', 'company', 'subscriptionModules', 'subscriptionModules.module', 'subscriptionModules.subModule'],
        });
        return subscriptions ? this.toDomain(subscriptions) : null;
    }
    async update(subscriptions) {
        const whereClause = { id: subscriptions.id };
        if (subscriptions.companyId) {
            whereClause.company = { id: subscriptions.companyId };
        }
        if (subscriptions.companyId && subscriptions.enabled === true) {
            await this.repo
                .createQueryBuilder()
                .update(subscriptions_orm_entity_1.SubscriptionsOrmEntity)
                .set({ enabled: false })
                .where('company_id = :companyId AND id != :id AND deleted = false', {
                companyId: subscriptions.companyId,
                id: subscriptions.id,
            })
                .execute();
        }
        await this.repo.update(whereClause, {
            plan: subscriptions.planId ? { id: subscriptions.planId } : undefined,
            begin_date: subscriptions.begin_date,
            end_date: subscriptions.end_date,
            enabled: subscriptions.enabled,
        });
        if (subscriptions.moduleIds !== undefined || subscriptions.subModuleIds !== undefined || subscriptions.planId) {
            let targetModIds = subscriptions.moduleIds || [];
            let targetSubModIds = subscriptions.subModuleIds || [];
            if (subscriptions.planId && (targetModIds.length === 0 || targetSubModIds.length === 0)) {
                const planPms = await this.repo.manager.query('SELECT module_id, sub_module_id FROM tab_plans_module WHERE plans_id = $1', [subscriptions.planId]);
                if (planPms && planPms.length > 0) {
                    const pModIds = [];
                    const pSubModIds = [];
                    for (const r of planPms) {
                        if (r.sub_module_id)
                            pSubModIds.push(Number(r.sub_module_id));
                        else if (r.module_id)
                            pModIds.push(Number(r.module_id));
                    }
                    if (targetModIds.length === 0)
                        targetModIds = Array.from(new Set(pModIds));
                    if (targetSubModIds.length === 0)
                        targetSubModIds = Array.from(new Set(pSubModIds));
                }
            }
            if (targetModIds.length === 0) {
                const allActiveMods = await this.repo.manager.query('SELECT id FROM tab_module WHERE enabled = true AND (deleted = false OR deleted IS NULL) ORDER BY id ASC');
                targetModIds = (allActiveMods || []).map((m) => Number(m.id));
                const allActiveSubMods = await this.repo.manager.query('SELECT id FROM tab_sub_module WHERE enabled = true AND (deleted = false OR deleted IS NULL) ORDER BY id ASC');
                targetSubModIds = (allActiveSubMods || []).map((sm) => Number(sm.id));
            }
            await this.syncSubscriptionAccess(subscriptions.id, targetModIds, targetSubModIds, subscriptions.companyId);
        }
        const updated = await this.findById(subscriptions.id, subscriptions.companyId);
        return updated;
    }
    async syncSubscriptionAccess(subscriptionId, moduleIds, subModuleIds, companyId) {
        access_control_service_1.AccessControlService.clearCache(companyId);
        let targetModIds = Array.from(new Set((moduleIds || []).map(Number).filter((id) => !isNaN(id) && id > 0)));
        let targetSubModIds = Array.from(new Set((subModuleIds || []).map(Number).filter((id) => !isNaN(id) && id > 0)));
        if (targetModIds.length === 0 || targetSubModIds.length === 0) {
            const subRow = await this.repo.findOne({
                where: { id: subscriptionId },
                relations: ['plan'],
            });
            const planId = subRow?.plan?.id || subRow?.plan_id;
            if (planId) {
                const planPms = await this.repo.manager.query('SELECT module_id, sub_module_id FROM tab_plans_module WHERE plans_id = $1', [planId]);
                if (planPms && planPms.length > 0) {
                    const pModIds = [];
                    const pSubModIds = [];
                    for (const r of planPms) {
                        if (r.sub_module_id)
                            pSubModIds.push(Number(r.sub_module_id));
                        else if (r.module_id)
                            pModIds.push(Number(r.module_id));
                    }
                    if (targetModIds.length === 0)
                        targetModIds = Array.from(new Set(pModIds));
                    if (targetSubModIds.length === 0)
                        targetSubModIds = Array.from(new Set(pSubModIds));
                }
            }
        }
        if (targetModIds.length === 0) {
            const allActiveMods = await this.repo.manager.query('SELECT id FROM tab_module WHERE enabled = true AND (deleted = false OR deleted IS NULL) ORDER BY id ASC');
            targetModIds = (allActiveMods || []).map((m) => Number(m.id));
            const allActiveSubMods = await this.repo.manager.query('SELECT id FROM tab_sub_module WHERE enabled = true AND (deleted = false OR deleted IS NULL) ORDER BY id ASC');
            targetSubModIds = (allActiveSubMods || []).map((sm) => Number(sm.id));
        }
        await this.subModuleRepo
            .createQueryBuilder()
            .delete()
            .from(subscriptions_module_orm_entity_1.SubscriptionsModuleOrmEntity)
            .where('subscriptions_id = :subscriptionId', { subscriptionId })
            .execute();
        for (const modId of targetModIds) {
            const entity = this.subModuleRepo.create({
                subscriptions: { id: subscriptionId },
                module: { id: modId },
                subModule: null,
                enabled: true,
                deleted: false,
            });
            await this.subModuleRepo.save(entity);
        }
        for (const subModId of targetSubModIds) {
            const entity = this.subModuleRepo.create({
                subscriptions: { id: subscriptionId },
                module: null,
                subModule: { id: subModId },
                enabled: true,
                deleted: false,
            });
            await this.subModuleRepo.save(entity);
        }
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
    async syncCompanyRolesWithSubscription(companyId, moduleIds, subModuleIds) {
        access_control_service_1.AccessControlService.clearCache(companyId);
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
            const nextCode = existingRoles.length === 0
                ? 'ROL-001'
                : `ROL-${String(existingRoles.length + 1).padStart(3, '0')}`;
            adminRole = await this.rolesRepo.save(this.rolesRepo.create({
                code: nextCode,
                description: 'Administrador',
                is_company_admin: true,
                enabled: true,
                deleted: false,
                company: { id: companyId },
            }));
        }
        else if (!adminRole.is_company_admin) {
            await this.rolesRepo.update({ id: adminRole.id }, { is_company_admin: true });
            adminRole.is_company_admin = true;
        }
        await this.roleModuleRepo
            .createQueryBuilder()
            .delete()
            .from(roles_orm_entity_1.RoleModuleOrmEntity)
            .where('role_id = :roleId', { roleId: adminRole.id })
            .execute();
        for (const modId of moduleIds) {
            await this.roleModuleRepo.save(this.roleModuleRepo.create({
                role: { id: adminRole.id },
                module: { id: modId },
                subModule: null,
                has_access: true,
                enabled: true,
                deleted: false,
            }));
        }
        for (const subModId of subModuleIds) {
            await this.roleModuleRepo.save(this.roleModuleRepo.create({
                role: { id: adminRole.id },
                module: null,
                subModule: { id: subModId },
                has_access: true,
                enabled: true,
                deleted: false,
            }));
        }
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
            const existingModIds = new Set();
            const existingSubModIds = new Set();
            for (const rm of existingRoleModules) {
                if (rm.subModule?.id) {
                    const smId = Number(rm.subModule.id);
                    if (!validSubModSet.has(smId)) {
                        await this.roleModuleRepo.delete({ id: rm.id });
                    }
                    else {
                        existingSubModIds.add(smId);
                    }
                }
                else if (rm.module?.id) {
                    const mId = Number(rm.module.id);
                    if (!validModSet.has(mId)) {
                        await this.roleModuleRepo.delete({ id: rm.id });
                    }
                    else {
                        existingModIds.add(mId);
                    }
                }
            }
            for (const modId of moduleIds) {
                if (!existingModIds.has(modId)) {
                    await this.roleModuleRepo.save(this.roleModuleRepo.create({
                        role: { id: r.id },
                        module: { id: modId },
                        subModule: null,
                        has_access: false,
                        enabled: true,
                        deleted: false,
                    }));
                }
            }
            for (const subModId of subModuleIds) {
                if (!existingSubModIds.has(subModId)) {
                    await this.roleModuleRepo.save(this.roleModuleRepo.create({
                        role: { id: r.id },
                        module: null,
                        subModule: { id: subModId },
                        has_access: false,
                        enabled: true,
                        deleted: false,
                    }));
                }
            }
        }
    }
    toDomain(entity) {
        const activeItems = (entity.subscriptionModules || []).filter((sm) => !sm.deleted && sm.enabled !== false);
        const moduleIds = Array.from(new Set(activeItems
            .filter((sm) => sm.module?.id)
            .map((sm) => Number(sm.module.id))));
        const subModuleIds = Array.from(new Set(activeItems
            .filter((sm) => sm.subModule?.id)
            .map((sm) => Number(sm.subModule.id))));
        return new subscriptions_entity_1.Subscriptions(entity.id, entity.begin_date, entity.end_date, entity.plan?.id, entity.company?.id, entity.enabled, entity.created_at, entity.created_by, moduleIds, subModuleIds);
    }
};
exports.SubscriptionsRepositoryImpl = SubscriptionsRepositoryImpl;
exports.SubscriptionsRepositoryImpl = SubscriptionsRepositoryImpl = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(subscriptions_orm_entity_1.SubscriptionsOrmEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(subscriptions_module_orm_entity_1.SubscriptionsModuleOrmEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(roles_orm_entity_1.RolesOrmEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(roles_orm_entity_1.RoleModuleOrmEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], SubscriptionsRepositoryImpl);
//# sourceMappingURL=subscriptions.repository.impl.js.map