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
const company_entity_1 = require("../../domain/entities/company.entity");
const typeorm_1 = require("@nestjs/typeorm");
const common_1 = require("@nestjs/common");
const typeorm_2 = require("typeorm");
let CompanyRepositoryImpl = class CompanyRepositoryImpl {
    repo;
    constructor(repo) {
        this.repo = repo;
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
        return this.toDomain(saved);
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
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CompanyRepositoryImpl);
//# sourceMappingURL=company.repository.impl.js.map