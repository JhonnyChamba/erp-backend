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
exports.PlansRepositoryImpl = void 0;
const plans_orm_entity_1 = require("../persistence/plans.orm-entity");
const plans_entity_1 = require("../../domain/entities/plans.entity");
const access_control_service_1 = require("../../../../auth/access-control.service");
const typeorm_1 = require("@nestjs/typeorm");
const common_1 = require("@nestjs/common");
const typeorm_2 = require("typeorm");
let PlansRepositoryImpl = class PlansRepositoryImpl {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async create(company) {
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
        for (const modId of targetModIds) {
            await this.repo.manager.query('INSERT INTO tab_plans_module (plans_id, module_id, sub_module_id) VALUES ($1, $2, NULL)', [saved.id, modId]);
        }
        if (targetSubModIds.length > 0) {
            const subModRows = await this.repo.manager.query('SELECT id, module_id FROM tab_sub_module WHERE id = ANY($1)', [targetSubModIds]);
            for (const row of subModRows || []) {
                await this.repo.manager.query('INSERT INTO tab_plans_module (plans_id, module_id, sub_module_id) VALUES ($1, $2, $3)', [saved.id, row.module_id, row.id]);
            }
        }
        const domain = this.toDomain(saved);
        domain.moduleIds = targetModIds;
        domain.subModuleIds = targetSubModIds;
        return domain;
    }
    async findByPlans(page, limit, search) {
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
        const modMap = {};
        const subModMap = {};
        if (planIds.length > 0) {
            const pms = await this.repo.manager.query('SELECT plans_id, module_id, sub_module_id FROM tab_plans_module WHERE plans_id = ANY($1)', [planIds]);
            for (const row of pms || []) {
                const pId = Number(row.plans_id);
                if (!modMap[pId])
                    modMap[pId] = [];
                if (!subModMap[pId])
                    subModMap[pId] = [];
                if (row.sub_module_id) {
                    subModMap[pId].push(Number(row.sub_module_id));
                }
                else if (row.module_id) {
                    modMap[pId].push(Number(row.module_id));
                }
            }
        }
        return {
            data: branches.map((company) => {
                const d = this.toDomain(company);
                d.moduleIds = Array.from(new Set(modMap[d.id] || []));
                d.subModuleIds = Array.from(new Set(subModMap[d.id] || []));
                return d;
            }),
            total,
        };
    }
    async findById(id) {
        const company = await this.repo.findOne({ where: { id } });
        if (!company)
            return null;
        const domain = this.toDomain(company);
        const pms = await this.repo.manager.query('SELECT module_id, sub_module_id FROM tab_plans_module WHERE plans_id = $1', [id]);
        const modIds = [];
        const subModIds = [];
        for (const row of pms || []) {
            if (row.sub_module_id) {
                subModIds.push(Number(row.sub_module_id));
            }
            else if (row.module_id) {
                modIds.push(Number(row.module_id));
            }
        }
        domain.moduleIds = Array.from(new Set(modIds));
        domain.subModuleIds = Array.from(new Set(subModIds));
        return domain;
    }
    async update(company) {
        const newModIds = company.moduleIds !== undefined
            ? Array.from(new Set(company.moduleIds.map(Number).filter((id) => !isNaN(id) && id > 0)))
            : undefined;
        const newSubModIds = company.subModuleIds !== undefined
            ? Array.from(new Set(company.subModuleIds.map(Number).filter((id) => !isNaN(id) && id > 0)))
            : undefined;
        await this.repo.manager.transaction(async (manager) => {
            await manager.update(plans_orm_entity_1.PlansOrmEntity, { id: company.id }, {
                price: company.price,
                billing_cycle: company.billing_cycle,
                description: company.description,
                max_users: company.max_users,
                max_branches: company.max_branches,
                enabled: company.enabled,
            });
            if (newModIds !== undefined || newSubModIds !== undefined) {
                const targetModIds = newModIds ?? [];
                const targetSubModIds = newSubModIds ?? [];
                await manager.query('DELETE FROM tab_plans_module WHERE plans_id = $1', [company.id]);
                for (const modId of targetModIds) {
                    await manager.query('INSERT INTO tab_plans_module (plans_id, module_id, sub_module_id) VALUES ($1, $2, NULL)', [company.id, modId]);
                }
                if (targetSubModIds.length > 0) {
                    const subModRows = await manager.query('SELECT id, module_id FROM tab_sub_module WHERE id = ANY($1)', [targetSubModIds]);
                    for (const row of subModRows || []) {
                        await manager.query('INSERT INTO tab_plans_module (plans_id, module_id, sub_module_id) VALUES ($1, $2, $3)', [company.id, row.module_id, row.id]);
                    }
                }
                await this.syncPlanChangesToSubscribedCompanies(manager, company.id, targetModIds, targetSubModIds);
            }
        });
        const updated = await this.findById(company.id);
        return updated;
    }
    async syncPlanChangesToSubscribedCompanies(manager, planId, planModIds, planSubModIds) {
        const activeSubs = await manager.query('SELECT id, company_id FROM tab_subscriptions WHERE plan_id = $1 AND enabled = true AND (deleted = false OR deleted IS NULL)', [planId]);
        if (!activeSubs || activeSubs.length === 0)
            return;
        const targetModSet = new Set(planModIds);
        const targetSubModSet = new Set(planSubModIds);
        for (const sub of activeSubs) {
            const subId = Number(sub.id);
            const companyId = Number(sub.company_id);
            const existingRows = await manager.query('SELECT id, module_id, sub_module_id FROM tab_subscription_module WHERE subscriptions_id = $1 AND (deleted = false OR deleted IS NULL)', [subId]);
            const currentModMap = new Map();
            const currentSubModMap = new Map();
            for (const r of existingRows || []) {
                if (r.sub_module_id) {
                    currentSubModMap.set(Number(r.sub_module_id), Number(r.id));
                }
                else if (r.module_id) {
                    currentModMap.set(Number(r.module_id), Number(r.id));
                }
            }
            const subModuleRowIdsToDelete = [];
            const removedModIds = [];
            const removedSubModIds = [];
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
                await manager.query('DELETE FROM tab_subscription_module WHERE id = ANY($1)', [subModuleRowIdsToDelete]);
            }
            const addedModIds = [];
            const addedSubModIds = [];
            for (const modId of planModIds) {
                if (!currentModMap.has(modId)) {
                    await manager.query('INSERT INTO tab_subscription_module (subscriptions_id, module_id, sub_module_id, enabled, deleted) VALUES ($1, $2, NULL, true, false)', [subId, modId]);
                    addedModIds.push(modId);
                }
            }
            if (planSubModIds.length > 0) {
                const subRows = await manager.query('SELECT id, module_id FROM tab_sub_module WHERE id = ANY($1)', [planSubModIds]);
                for (const sr of subRows || []) {
                    const smId = Number(sr.id);
                    if (!currentSubModMap.has(smId)) {
                        await manager.query('INSERT INTO tab_subscription_module (subscriptions_id, module_id, sub_module_id, enabled, deleted) VALUES ($1, $2, $3, true, false)', [subId, sr.module_id, smId]);
                        addedSubModIds.push(smId);
                    }
                }
            }
            const companyRoles = await manager.query('SELECT id, is_company_admin, description, code FROM tab_role WHERE company_id = $1 AND (deleted = false OR deleted IS NULL)', [companyId]);
            if (companyRoles && companyRoles.length > 0) {
                const roleIds = companyRoles.map((r) => Number(r.id));
                if (removedModIds.length > 0) {
                    await manager.query('DELETE FROM tab_role_module WHERE role_id = ANY($1) AND module_id = ANY($2) AND sub_module_id IS NULL', [roleIds, removedModIds]);
                }
                if (removedSubModIds.length > 0) {
                    await manager.query('DELETE FROM tab_role_module WHERE role_id = ANY($1) AND sub_module_id = ANY($2)', [roleIds, removedSubModIds]);
                }
                for (const role of companyRoles) {
                    const rId = Number(role.id);
                    const isAdm = Boolean(role.is_company_admin) ||
                        (role.description || '').trim().toLowerCase().startsWith('administrador') ||
                        role.code === 'ROL-001';
                    for (const modId of addedModIds) {
                        const exists = await manager.query('SELECT 1 FROM tab_role_module WHERE role_id = $1 AND module_id = $2 AND sub_module_id IS NULL LIMIT 1', [rId, modId]);
                        if (!exists || exists.length === 0) {
                            await manager.query('INSERT INTO tab_role_module (role_id, module_id, sub_module_id, has_access, enabled, deleted) VALUES ($1, $2, NULL, $3, true, false)', [rId, modId, isAdm]);
                        }
                    }
                    for (const subModId of addedSubModIds) {
                        const exists = await manager.query('SELECT 1 FROM tab_role_module WHERE role_id = $1 AND sub_module_id = $2 LIMIT 1', [rId, subModId]);
                        if (!exists || exists.length === 0) {
                            await manager.query('INSERT INTO tab_role_module (role_id, module_id, sub_module_id, has_access, enabled, deleted) VALUES ($1, NULL, $2, $3, true, false)', [rId, subModId, isAdm]);
                        }
                    }
                }
            }
            access_control_service_1.AccessControlService.clearCache(companyId);
        }
    }
    toDomain(entity) {
        return new plans_entity_1.Plans(entity.id, entity.price, entity.billing_cycle, entity.description, entity.max_users, entity.max_branches, entity.enabled, entity.created_name, entity.createdAt);
    }
};
exports.PlansRepositoryImpl = PlansRepositoryImpl;
exports.PlansRepositoryImpl = PlansRepositoryImpl = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(plans_orm_entity_1.PlansOrmEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], PlansRepositoryImpl);
//# sourceMappingURL=plans.repository.impl.js.map