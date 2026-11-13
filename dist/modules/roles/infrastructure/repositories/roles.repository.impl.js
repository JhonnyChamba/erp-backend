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
exports.RolesRepositoryImpl = void 0;
const roles_orm_entity_1 = require("../persistence/roles.orm-entity");
const subscriptions_orm_entity_1 = require("../../../subscriptions/infrastructure/persistence/subscriptions.orm-entity");
const access_control_service_1 = require("../../../../auth/access-control.service");
const roles_entity_1 = require("../../domain/entities/roles.entity");
const typeorm_1 = require("@nestjs/typeorm");
const common_1 = require("@nestjs/common");
const typeorm_2 = require("typeorm");
let RolesRepositoryImpl = class RolesRepositoryImpl {
    repo;
    roleModuleRepo;
    subscriptionsRepo;
    constructor(repo, roleModuleRepo, subscriptionsRepo) {
        this.repo = repo;
        this.roleModuleRepo = roleModuleRepo;
        this.subscriptionsRepo = subscriptionsRepo;
    }
    async create(roles) {
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
        await this.syncRoleAccess(saved.id, roles.moduleIds || [], roles.subModuleIds || [], roles.details);
        const full = await this.findById(saved.id, roles.companyId);
        return full || this.toDomain(saved);
    }
    async generateNextCode(companyId) {
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
    async findByCompany(companyId, page, limit) {
        let targetCompanyId = Number(companyId);
        let validCompany = false;
        if (targetCompanyId && targetCompanyId > 0) {
            const check = await this.repo.manager.query('SELECT id FROM tab_company WHERE id = $1 AND (deleted = false OR deleted IS NULL)', [targetCompanyId]);
            if (check && check.length > 0) {
                validCompany = true;
            }
        }
        if (!validCompany) {
            const firstComp = await this.repo.manager.query('SELECT id FROM tab_company WHERE (deleted = false OR deleted IS NULL) ORDER BY id ASC LIMIT 1');
            if (firstComp && firstComp.length > 0) {
                targetCompanyId = Number(firstComp[0].id);
                validCompany = true;
            }
            else {
                return { data: [], total: 0 };
            }
        }
        await this.repo
            .createQueryBuilder()
            .update(roles_orm_entity_1.RolesOrmEntity)
            .set({ company: { id: targetCompanyId } })
            .where('company_id IS NULL')
            .execute();
        try {
            await this.ensureCompanyAdminRoleSynced(targetCompanyId);
        }
        catch (syncErr) {
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
    async ensureCompanyAdminRoleSynced(companyId) {
        if (!companyId || companyId <= 0)
            return;
        const compExists = await this.repo.manager.query('SELECT id FROM tab_company WHERE id = $1 AND (deleted = false OR deleted IS NULL)', [companyId]);
        if (!compExists || compExists.length === 0)
            return;
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
            adminRole = await this.repo.save(this.repo.create({
                code: nextCode,
                description: 'Administrador',
                enabled: true,
                deleted: false,
                company: { id: companyId },
            }));
            adminRole.roleModules = [];
        }
        const activeSubs = await this.subscriptionsRepo.find({
            where: { company: { id: companyId }, deleted: false, enabled: true },
            relations: ['subscriptionModules', 'subscriptionModules.module', 'subscriptionModules.subModule'],
        });
        const subModIds = new Set();
        const modIds = new Set();
        for (const sub of activeSubs) {
            for (const sm of sub.subscriptionModules || []) {
                if (!sm.deleted && sm.enabled !== false) {
                    if (sm.module?.id)
                        modIds.add(Number(sm.module.id));
                    if (sm.subModule?.id)
                        subModIds.add(Number(sm.subModule.id));
                }
            }
        }
        const currentActive = (adminRole.roleModules || []).filter((rm) => !rm.deleted && rm.enabled !== false && rm.has_access);
        const currentModSet = new Set(currentActive.filter((rm) => rm.module?.id || rm.module_id).map((rm) => Number(rm.module?.id || rm.module_id)));
        const currentSubModSet = new Set(currentActive.filter((rm) => rm.subModule?.id || rm.sub_module_id).map((rm) => Number(rm.subModule?.id || rm.sub_module_id)));
        const needsSync = (modIds.size > 0 || subModIds.size > 0) &&
            (currentActive.length === 0 ||
                Array.from(modIds).some((id) => !currentModSet.has(id)) ||
                Array.from(subModIds).some((id) => !currentSubModSet.has(id)));
        if (needsSync) {
            await this.syncRoleAccess(adminRole.id, Array.from(modIds), Array.from(subModIds));
        }
    }
    async findById(id, companyId) {
        let roles = await this.repo.findOne({
            where: { id, deleted: false },
            relations: ['company', 'roleModules', 'roleModules.module', 'roleModules.subModule'],
        });
        if (roles && !roles.company && companyId) {
            await this.repo.update({ id }, { company: { id: companyId } });
            roles.company = { id: companyId };
        }
        return roles ? this.toDomain(roles) : null;
    }
    async update(roles) {
        const updatePayload = {
            code: roles.code,
            description: roles.description,
            enabled: roles.enabled,
        };
        if (roles.companyId) {
            updatePayload.company = { id: roles.companyId };
        }
        await this.repo.update({ id: roles.id }, updatePayload);
        if (roles.moduleIds !== undefined ||
            roles.subModuleIds !== undefined ||
            roles.details !== undefined) {
            await this.syncRoleAccess(roles.id, roles.moduleIds || [], roles.subModuleIds || [], roles.details);
        }
        const updated = await this.findById(roles.id, roles.companyId);
        return updated;
    }
    async syncRoleAccess(roleId, moduleIds, subModuleIds, details) {
        access_control_service_1.AccessControlService.clearCache();
        await this.roleModuleRepo
            .createQueryBuilder()
            .update(roles_orm_entity_1.RoleModuleOrmEntity)
            .set({ deleted: true, enabled: false })
            .where('role_id = :roleId', { roleId })
            .execute();
        if (Array.isArray(details) && details.length > 0) {
            for (const item of details) {
                const entity = this.roleModuleRepo.create({
                    role: { id: roleId },
                    module: item.moduleId ? { id: Number(item.moduleId) } : null,
                    subModule: item.subModuleId ? { id: Number(item.subModuleId) } : null,
                    has_access: Boolean(item.hasAccess),
                    enabled: true,
                    deleted: false,
                });
                await this.roleModuleRepo.save(entity);
            }
            return;
        }
        const targetModIds = Array.from(new Set((moduleIds || []).map(Number).filter((id) => !isNaN(id) && id > 0)));
        const targetSubModIds = Array.from(new Set((subModuleIds || []).map(Number).filter((id) => !isNaN(id) && id > 0)));
        for (const modId of targetModIds) {
            const entity = this.roleModuleRepo.create({
                role: { id: roleId },
                module: { id: modId },
                subModule: null,
                has_access: true,
                enabled: true,
                deleted: false,
            });
            await this.roleModuleRepo.save(entity);
        }
        for (const subModId of targetSubModIds) {
            const entity = this.roleModuleRepo.create({
                role: { id: roleId },
                module: null,
                subModule: { id: subModId },
                has_access: true,
                enabled: true,
                deleted: false,
            });
            await this.roleModuleRepo.save(entity);
        }
    }
    toDomain(entity) {
        const activeItems = (entity.roleModules || []).filter((rm) => !rm.deleted && rm.enabled !== false);
        const moduleIds = Array.from(new Set(activeItems
            .filter((rm) => rm.module?.id && rm.has_access !== false)
            .map((rm) => Number(rm.module.id))));
        const subModuleIds = Array.from(new Set(activeItems
            .filter((rm) => rm.subModule?.id && rm.has_access !== false)
            .map((rm) => Number(rm.subModule.id))));
        const details = activeItems.map((rm) => ({
            moduleId: rm.module?.id ? Number(rm.module.id) : null,
            subModuleId: rm.subModule?.id ? Number(rm.subModule.id) : null,
            hasAccess: rm.has_access !== false,
        }));
        return new roles_entity_1.Roles(entity.id, entity.code, entity.description, entity.company?.id, entity.enabled, entity.created_at, entity.created_by, moduleIds, subModuleIds, details);
    }
};
exports.RolesRepositoryImpl = RolesRepositoryImpl;
exports.RolesRepositoryImpl = RolesRepositoryImpl = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(roles_orm_entity_1.RolesOrmEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(roles_orm_entity_1.RoleModuleOrmEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(subscriptions_orm_entity_1.SubscriptionsOrmEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], RolesRepositoryImpl);
//# sourceMappingURL=roles.repository.impl.js.map