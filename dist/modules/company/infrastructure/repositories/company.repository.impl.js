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
const secret_crypto_1 = require("../../../../common/crypto/secret-crypto");
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
    buildExtraColumns(company) {
        const f = company.fiscal || {};
        const s = company.secrets || {};
        const cols = {};
        for (const k of [
            'address_matriz', 'phone', 'email', 'obligated_accounting', 'special_taxpayer', 'tax_regime',
            'sri_environment', 'default_establishment', 'default_emission_point', 'cert_file_name',
            'smtp_host', 'smtp_port', 'smtp_secure', 'smtp_user', 'smtp_from_name', 'smtp_from_email',
        ]) {
            if (f[k] !== undefined)
                cols[k] = f[k] === '' ? null : f[k];
        }
        if (f.cert_expires_at !== undefined)
            cols.cert_expires_at = f.cert_expires_at || null;
        if (s.remove_certificate) {
            cols.cert_p12_base64 = null;
            cols.cert_password_enc = null;
            cols.cert_file_name = null;
            cols.cert_expires_at = null;
        }
        if (s.cert_p12_base64)
            cols.cert_p12_base64 = s.cert_p12_base64;
        if (s.cert_password)
            cols.cert_password_enc = (0, secret_crypto_1.encryptSecret)(s.cert_password);
        if (s.smtp_password) {
            cols.smtp_password_enc = (0, secret_crypto_1.encryptSecret)(s.smtp_password);
            cols.smtp_has_password = true;
        }
        return cols;
    }
    async create(company) {
        const entity = this.repo.create({
            ruc: company.ruc,
            description: company.description,
            business_name: company.business_name,
            trade_name: company.trade_name,
            enabled: company.enabled,
            created_name: company.created_name,
            createdBy: { id: company.createdById },
            ...this.buildExtraColumns(company),
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
    async findByCompany(page, limit, companyIds) {
        const [branches, total] = await this.repo.findAndCount({
            where: companyIds ? { deleted: false, id: (0, typeorm_2.In)(companyIds) } : { deleted: false },
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
            ...this.buildExtraColumns(company),
        });
        const updated = await this.repo.findOne({ where: { id: company.id } });
        return this.toDomain(updated);
    }
    toDomain(entity) {
        return new company_entity_1.Company(entity.id, entity.ruc, entity.description, entity.business_name, entity.trade_name, entity.enabled, entity.deleted, entity.created_name, entity.createdAt, undefined, {
            address_matriz: entity.address_matriz ?? '',
            phone: entity.phone ?? '',
            email: entity.email ?? '',
            obligated_accounting: entity.obligated_accounting ?? false,
            special_taxpayer: entity.special_taxpayer ?? '',
            tax_regime: entity.tax_regime ?? 'GENERAL',
            sri_environment: entity.sri_environment ?? '1',
            default_establishment: entity.default_establishment ?? '001',
            default_emission_point: entity.default_emission_point ?? '001',
            cert_file_name: entity.cert_file_name ?? '',
            cert_expires_at: entity.cert_expires_at ?? '',
            has_certificate: Boolean(entity.cert_file_name),
            smtp_host: entity.smtp_host ?? '',
            smtp_port: entity.smtp_port ?? 587,
            smtp_secure: entity.smtp_secure ?? true,
            smtp_user: entity.smtp_user ?? '',
            has_smtp_password: Boolean(entity.smtp_has_password),
            smtp_from_name: entity.smtp_from_name ?? '',
            smtp_from_email: entity.smtp_from_email ?? '',
        });
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