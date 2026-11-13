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
const contacts_orm_entity_1 = require("../../../contacts/infrastructure/persistence/contacts.orm-entity");
const inventory_orm_entity_1 = require("../../../inventory/infrastructure/persistence/inventory.orm-entity");
const branch_company_orm_entity_1 = require("../../../branch-company/infrastructure/persistence/branch-company.orm-entity");
const emission_point_orm_entity_1 = require("../../../sales/infrastructure/persistence/emission-point.orm-entity");
const tax_orm_entity_1 = require("../../../configuration/infrastructure/persistence/tax.orm-entity");
const document_type_orm_entity_1 = require("../../../configuration/infrastructure/persistence/document-type.orm-entity");
const user_company_orm_entity_1 = require("../../../user-company/infrastructure/persistence/user-company.orm-entity");
const company_entity_1 = require("../../domain/entities/company.entity");
const secret_crypto_1 = require("../../../../common/crypto/secret-crypto");
const cert_inspector_util_1 = require("../../application/cert-inspector.util");
const typeorm_1 = require("@nestjs/typeorm");
const common_1 = require("@nestjs/common");
const typeorm_2 = require("typeorm");
let CompanyRepositoryImpl = class CompanyRepositoryImpl {
    repo;
    rolesRepo;
    roleModuleRepo;
    subscriptionsRepo;
    customerRepo;
    sellerRepo;
    warehouseRepo;
    branchRepo;
    emissionPointRepo;
    sequenceRepo;
    taxRepo;
    docTypeRepo;
    userCompanyRepo;
    constructor(repo, rolesRepo, roleModuleRepo, subscriptionsRepo, customerRepo, sellerRepo, warehouseRepo, branchRepo, emissionPointRepo, sequenceRepo, taxRepo, docTypeRepo, userCompanyRepo) {
        this.repo = repo;
        this.rolesRepo = rolesRepo;
        this.roleModuleRepo = roleModuleRepo;
        this.subscriptionsRepo = subscriptionsRepo;
        this.customerRepo = customerRepo;
        this.sellerRepo = sellerRepo;
        this.warehouseRepo = warehouseRepo;
        this.branchRepo = branchRepo;
        this.emissionPointRepo = emissionPointRepo;
        this.sequenceRepo = sequenceRepo;
        this.taxRepo = taxRepo;
        this.docTypeRepo = docTypeRepo;
        this.userCompanyRepo = userCompanyRepo;
    }
    buildExtraColumns(company) {
        const f = company.fiscal || {};
        const s = company.secrets || {};
        const cols = {};
        for (const k of [
            'address_matriz', 'phone', 'email', 'obligated_accounting', 'special_taxpayer', 'tax_regime',
            'sri_environment', 'auto_send_sri', 'default_establishment', 'default_emission_point', 'cert_file_name',
            'smtp_host', 'smtp_port', 'smtp_secure', 'smtp_user', 'smtp_from_name', 'smtp_from_email', 'logo_url',
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
        if (s.cert_p12_base64 && s.cert_password) {
            try {
                const certInfo = (0, cert_inspector_util_1.inspectP12)(s.cert_p12_base64, s.cert_password);
                if (certInfo.expires_at) {
                    cols.cert_expires_at = certInfo.expires_at;
                }
            }
            catch (certErr) {
                console.warn('No se pudo auto-extraer fecha de caducidad del .p12:', certErr);
            }
        }
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
        await this.ensureCompanyDefaults(saved.id, company.createdById, company);
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
    async ensureCompanyDefaults(companyId, createdById, companyData) {
        try {
            const existingCustomer = await this.customerRepo.findOne({
                where: { company_id: companyId, num_document: '9999999999999', deleted: false },
            });
            if (!existingCustomer) {
                await this.customerRepo.save(this.customerRepo.create({
                    company_id: companyId,
                    tipo_documento: '07',
                    num_document: '9999999999999',
                    razon_social: 'CONSUMIDOR FINAL',
                    nombre_comercial: 'CONSUMIDOR FINAL',
                    direccion: 'S/N',
                    email: 'consumidorfinal@deskounta.com',
                    telefono: '999999999',
                    ciudad: 'Ecuador',
                    estado: 'activo',
                    deleted: false,
                    created_by: createdById,
                }));
            }
            const existingSeller = await this.sellerRepo.findOne({
                where: { company_id: companyId, num_document: '9999999999', deleted: false },
            });
            if (!existingSeller) {
                await this.sellerRepo.save(this.sellerRepo.create({
                    company_id: companyId,
                    tipo_documento: '05',
                    num_document: '9999999999',
                    nombres: 'VENDEDOR',
                    apellidos: 'GENERAL',
                    comision_pct: 0,
                    direccion: 'S/N',
                    email: '',
                    telefono: '',
                    estado: 'activo',
                    deleted: false,
                    created_by: createdById,
                }));
            }
            const existingWarehouse = await this.warehouseRepo.findOne({
                where: { company: { id: companyId }, deleted: false },
            });
            if (!existingWarehouse) {
                await this.warehouseRepo.save(this.warehouseRepo.create({
                    code: 'BOD-001',
                    name: 'Bodega Matriz',
                    description: 'Bodega principal de almacenamiento y despacho',
                    address: companyData?.fiscal?.address_matriz || companyData?.description || 'Matriz',
                    is_default: true,
                    company: { id: companyId },
                    created_by: createdById,
                    enabled: true,
                    deleted: false,
                }));
            }
            let matrixBranch = await this.branchRepo.findOne({
                where: { company: { id: companyId }, deleted: false, is_matrix: true },
            });
            if (!matrixBranch) {
                matrixBranch = await this.branchRepo.findOne({
                    where: { company: { id: companyId }, deleted: false },
                });
            }
            if (!matrixBranch) {
                matrixBranch = await this.branchRepo.save(this.branchRepo.create({
                    code: '001',
                    name: 'MATRIZ',
                    address: companyData?.fiscal?.address_matriz || companyData?.description || 'Matriz',
                    emission_point: '001',
                    phone: companyData?.fiscal?.phone || null,
                    email: companyData?.fiscal?.email || null,
                    is_matrix: true,
                    company: { id: companyId },
                    created_by: createdById,
                    enabled: true,
                    deleted: false,
                }));
            }
            if (matrixBranch) {
                let ep = await this.emissionPointRepo.findOne({
                    where: { company: { id: companyId }, branch: { id: matrixBranch.id }, serie: '001', deleted: false },
                });
                if (!ep) {
                    ep = await this.emissionPointRepo.save(this.emissionPointRepo.create({
                        company: { id: companyId },
                        branch: { id: matrixBranch.id },
                        description: 'Punto de Emisión 001',
                        serie: '001',
                        enabled: true,
                        deleted: false,
                        created_by: createdById,
                    }));
                }
                const docTypes = [
                    { type: 'FACTURAS', code: '01' },
                    { type: 'NOTAS_CREDITO', code: '04' },
                    { type: 'RETENCIONES', code: '07' },
                    { type: 'GUIAS_REMISION', code: '06' },
                    { type: 'NOTAS_DEBITO', code: '05' },
                    { type: 'LIQUIDACIONES_COMPRA', code: '03' },
                ];
                for (const dt of docTypes) {
                    const existingSeq = await this.sequenceRepo.findOne({
                        where: { emission_point: { id: ep.id }, document_type: dt.type },
                    });
                    if (!existingSeq) {
                        await this.sequenceRepo.save(this.sequenceRepo.create({
                            company: { id: companyId },
                            emission_point: { id: ep.id },
                            document_type: dt.type,
                            document_code: dt.code,
                            serie: '001',
                            correlative: 0,
                            enabled: true,
                        }));
                    }
                }
            }
            const defaultTaxes = [
                { code: '4', percentage: 15, description: 'IVA 15%', is_default: true },
                { code: '0', percentage: 0, description: 'IVA 0%', is_default: false },
                { code: '6', percentage: 0, description: 'No Objeto de Impuesto', is_default: false },
                { code: '7', percentage: 0, description: 'Exento de IVA', is_default: false },
            ];
            for (const tax of defaultTaxes) {
                const existingTax = await this.taxRepo.findOne({
                    where: { company_id: companyId, code: tax.code, deleted: false },
                });
                if (!existingTax) {
                    await this.taxRepo.save(this.taxRepo.create({
                        company_id: companyId,
                        code: tax.code,
                        percentage: tax.percentage,
                        description: tax.description,
                        is_default: tax.is_default,
                        status: 'ACTIVO',
                        deleted: false,
                    }));
                }
            }
            const defaultDocTypes = [
                { code: '05', name: 'Cédula de Identidad', type: 'TODOS' },
                { code: '04', name: 'RUC', type: 'TODOS' },
                { code: '07', name: 'Consumidor Final', type: 'CLIENTE' },
                { code: '06', name: 'Pasaporte', type: 'TODOS' },
            ];
            for (const dt of defaultDocTypes) {
                try {
                    const existingDt = await this.docTypeRepo.findOne({
                        where: { code: dt.code, type: dt.type, deleted: false },
                    });
                    if (!existingDt) {
                        await this.docTypeRepo.save(this.docTypeRepo.create({
                            code: dt.code,
                            name: dt.name,
                            type: dt.type,
                            status: 'ACTIVO',
                            deleted: false,
                        }));
                    }
                }
                catch (docErr) {
                }
            }
            if (createdById) {
                const existingLink = await this.userCompanyRepo.findOne({
                    where: { user: { id: createdById }, company: { id: companyId }, deleted: false },
                });
                if (!existingLink) {
                    const adminRole = await this.rolesRepo.findOne({
                        where: { company: { id: companyId }, deleted: false },
                        order: { id: 'ASC' },
                    });
                    await this.userCompanyRepo.save(this.userCompanyRepo.create({
                        user: { id: createdById },
                        company: { id: companyId },
                        role: adminRole ? { id: adminRole.id } : null,
                        enabled: true,
                        deleted: false,
                    }));
                }
            }
        }
        catch (err) {
            console.error(`Error aprovisionando valores por defecto para empresa ${companyId}:`, err);
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
            relations: ['createdBy'],
        });
        if (company) {
            await this.ensureCompanyDefaults(company.id, company.createdBy?.id);
        }
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
            auto_send_sri: Boolean(entity.auto_send_sri),
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
            logo_url: entity.logo_url ?? '',
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
    __param(4, (0, typeorm_1.InjectRepository)(contacts_orm_entity_1.CustomerOrmEntity)),
    __param(5, (0, typeorm_1.InjectRepository)(contacts_orm_entity_1.SellerOrmEntity)),
    __param(6, (0, typeorm_1.InjectRepository)(inventory_orm_entity_1.InventoryWarehouseOrmEntity)),
    __param(7, (0, typeorm_1.InjectRepository)(branch_company_orm_entity_1.BranchCompanyOrmEntity)),
    __param(8, (0, typeorm_1.InjectRepository)(emission_point_orm_entity_1.EmissionPointOrmEntity)),
    __param(9, (0, typeorm_1.InjectRepository)(emission_point_orm_entity_1.EmissionPointSequenceOrmEntity)),
    __param(10, (0, typeorm_1.InjectRepository)(tax_orm_entity_1.TaxOrmEntity)),
    __param(11, (0, typeorm_1.InjectRepository)(document_type_orm_entity_1.DocumentTypeOrmEntity)),
    __param(12, (0, typeorm_1.InjectRepository)(user_company_orm_entity_1.UserCompanyOrmEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], CompanyRepositoryImpl);
//# sourceMappingURL=company.repository.impl.js.map