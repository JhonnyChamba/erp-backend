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
exports.TaxService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const tax_orm_entity_1 = require("../infrastructure/persistence/tax.orm-entity");
let TaxService = class TaxService {
    taxRepo;
    constructor(taxRepo) {
        this.taxRepo = taxRepo;
    }
    async ensureDefaultTaxes(companyId) {
        const count = await this.taxRepo.count({
            where: { company_id: companyId, deleted: false },
        });
        if (count > 0)
            return;
        const defaults = [
            { code: '4', percentage: 15.0, description: 'IVA 15% (Tarifa General)', is_default: true },
            { code: '0', percentage: 0.0, description: 'IVA 0% (Tarifa Cero)', is_default: false },
            { code: '6', percentage: 0.0, description: 'No Objeto de Impuesto', is_default: false },
            { code: '7', percentage: 0.0, description: 'Exento de IVA', is_default: false },
            { code: '2', percentage: 5.0, description: 'IVA 5% (Materiales Construcción)', is_default: false },
        ];
        for (const d of defaults) {
            const tax = this.taxRepo.create({
                company_id: companyId,
                code: d.code,
                percentage: d.percentage,
                description: d.description,
                is_default: d.is_default,
                status: 'ACTIVO',
                deleted: false,
            });
            await this.taxRepo.save(tax);
        }
    }
    async list(companyId, onlyActive = false) {
        await this.ensureDefaultTaxes(companyId);
        const where = { company_id: companyId, deleted: false };
        if (onlyActive) {
            where.status = 'ACTIVO';
        }
        return this.taxRepo.find({
            where,
            order: { is_default: 'DESC', percentage: 'DESC', id: 'ASC' },
        });
    }
    async get(id, companyId) {
        const tax = await this.taxRepo.findOne({
            where: { id, company_id: companyId, deleted: false },
        });
        if (!tax) {
            throw new common_1.NotFoundException(`El impuesto con ID ${id} no existe en la empresa.`);
        }
        return tax;
    }
    async create(companyId, dto) {
        const existing = await this.taxRepo.findOne({
            where: { company_id: companyId, code: dto.code.trim(), deleted: false },
        });
        if (existing) {
            throw new common_1.ConflictException(`Ya existe un impuesto con el código "${dto.code}" en esta empresa.`);
        }
        if (dto.is_default) {
            await this.taxRepo.update({ company_id: companyId }, { is_default: false });
        }
        const entity = this.taxRepo.create({
            company_id: companyId,
            code: dto.code.trim(),
            percentage: Number(dto.percentage),
            description: dto.description.trim(),
            status: dto.status || 'ACTIVO',
            is_default: Boolean(dto.is_default),
            deleted: false,
        });
        return this.taxRepo.save(entity);
    }
    async update(id, companyId, dto) {
        const tax = await this.get(id, companyId);
        if (dto.code && dto.code.trim() !== tax.code) {
            const existing = await this.taxRepo.findOne({
                where: { company_id: companyId, code: dto.code.trim(), deleted: false },
            });
            if (existing && existing.id !== id) {
                throw new common_1.ConflictException(`Ya existe un impuesto con el código "${dto.code}" en esta empresa.`);
            }
            tax.code = dto.code.trim();
        }
        if (dto.percentage !== undefined)
            tax.percentage = Number(dto.percentage);
        if (dto.description)
            tax.description = dto.description.trim();
        if (dto.status)
            tax.status = dto.status;
        if (dto.is_default !== undefined) {
            if (dto.is_default) {
                await this.taxRepo.update({ company_id: companyId }, { is_default: false });
            }
            tax.is_default = Boolean(dto.is_default);
        }
        return this.taxRepo.save(tax);
    }
    async toggleStatus(id, companyId) {
        const tax = await this.get(id, companyId);
        tax.status = tax.status === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
        return this.taxRepo.save(tax);
    }
    async remove(id, companyId) {
        const tax = await this.get(id, companyId);
        tax.deleted = true;
        await this.taxRepo.save(tax);
        return { success: true, message: 'Impuesto eliminado correctamente.' };
    }
};
exports.TaxService = TaxService;
exports.TaxService = TaxService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(tax_orm_entity_1.TaxOrmEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], TaxService);
//# sourceMappingURL=tax.service.js.map