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
exports.CompanyRepositoryImpl = void 0;
const company_orm_entity_1 = require("../persistence/company.orm-entity");
const roles_orm_entity_1 = require("../../../roles/infrastructure/persistence/roles.orm-entity");
const subscriptions_orm_entity_1 = require("../../../subscriptions/infrastructure/persistence/subscriptions.orm-entity");
const company_entity_1 = require("../../domain/entities/company.entity");
const typeorm_1 = require("@nestjs/typeorm");
const common_1 = require("@nestjs/common");
const typeorm_2 = require("typeorm");
let CompanyRepositoryImpl = class CompanyRepositoryImpl {
    repo;
    rolesRepo;
    roleModuleRepo;
    subscriptionsRepo;
    constructor(repo, rolesRepo, roleModuleRepo, subscriptionsRepo) {
        this.repo = repo;
        this.rolesRepo = rolesRepo;
        this.roleModuleRepo = roleModuleRepo;
        this.subscriptionsRepo = subscriptionsRepo;
    }
    async create(company) {
        const entity = this.repo.create({
            ruc: company.ruc,
            description: company.description,
            business_name: company.business_name,
            trade_name: company.trade_name,
            enabled: company.enabled,
            created_name: company.created_name,
            createdBy: { id: company.createdById }
        });
        const saved = await this.repo.save(entity);
        await this.ensureDefaultAdminRole(saved.id, company.createdById);
        return this.toDomain(saved);
    }
    async ensureDefaultAdminRole(companyId, createdById) {
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
            const nextCode = existingRoles.length === 0 ? 'ROL-001' : `ROL-${String(existingRoles.length + 1).padStart(3, '0')}`;
            adminRole = await this.rolesRepo.save(this.rolesRepo.create({
                code: nextCode,
                description: 'Administrador',
                enabled: true,
                deleted: false,
                company: { id: companyId },
                created_by: createdById,
            }));
        }
        const activeSubs = await this.subscriptionsRepo.find({
            where: { company: { id: companyId }, deleted: false, enabled: true },
            relations: ['subscriptionModules', 'subscriptionModules.module', 'subscriptionModules.subModule'],
        });
        const modIds = new Set();
        const subModIds = new Set();
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
        if (modIds.size > 0 || subModIds.size > 0) {
            await this.roleModuleRepo
                .createQueryBuilder()
                .update(roles_orm_entity_1.RoleModuleOrmEntity)
                .set({ deleted: true, enabled: false })
                .where('role_id = :roleId', { roleId: adminRole.id })
                .execute();
            for (const modId of modIds) {
                await this.roleModuleRepo.save(this.roleModuleRepo.create({
                    role: { id: adminRole.id },
                    module: { id: modId },
                    subModule: null,
                    has_access: true,
                    enabled: true,
                    deleted: false,
                }));
            }
            for (const subModId of subModIds) {
                await this.roleModuleRepo.save(this.roleModuleRepo.create({
                    role: { id: adminRole.id },
                    module: null,
                    subModule: { id: subModId },
                    has_access: true,
                    enabled: true,
                    deleted: false,
                }));
            }
        }
    }
    async findByCompany(page, limit) {
        const [branches, total] = await this.repo.findAndCount({
            where: { deleted: false },
            skip: (page - 1) * limit,
            take: limit,
            order: { createdAt: 'DESC' },
        });
        return {
            data: branches.map(company => this.toDomain(company)),
            total,
        };
    }
    async findById(id) {
        const company = await this.repo.findOne({
            where: {
                id,
                deleted: false,
            },
        });
        return company ? this.toDomain(company) : null;
    }
    async update(company) {
        await this.repo.update({ id: company.id }, {
            ruc: company.ruc,
            description: company.description,
            business_name: company.business_name,
            trade_name: company.trade_name,
            enabled: company.enabled,
        });
        const updated = await this.repo.findOne({ where: { id: company.id } });
        return this.toDomain(updated);
    }
    toDomain(entity) {
        return new company_entity_1.Company(entity.id, entity.ruc, entity.description, entity.business_name, entity.trade_name, entity.enabled, entity.deleted, entity.created_name, entity.createdAt);
    }
};
exports.CompanyRepositoryImpl = CompanyRepositoryImpl;
exports.CompanyRepositoryImpl = CompanyRepositoryImpl = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(company_orm_entity_1.CompanyOrmEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(roles_orm_entity_1.RolesOrmEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(roles_orm_entity_1.RoleModuleOrmEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(subscriptions_orm_entity_1.SubscriptionsOrmEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], CompanyRepositoryImpl);
//# sourceMappingURL=company.repository.impl.js.map