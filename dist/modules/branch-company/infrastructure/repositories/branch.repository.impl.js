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
exports.BranchCompanyRepositoryImpl = void 0;
const branch_company_orm_entity_1 = require("../persistence/branch-company.orm-entity");
const branch_company_entity_1 = require("../../domain/entities/branch-company.entity");
const typeorm_1 = require("@nestjs/typeorm");
const common_1 = require("@nestjs/common");
const typeorm_2 = require("typeorm");
let BranchCompanyRepositoryImpl = class BranchCompanyRepositoryImpl {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async create(branch) {
        const entity = this.repo.create({
            code: branch.code,
            name: branch.name,
            address: branch.address,
            enabled: branch.enabled,
            company: { id: branch.companyId },
            created_by: branch.createdById
        });
        const saved = await this.repo.save(entity);
        return this.toDomain(saved);
    }
    async findByCompany(companyId, page, limit) {
        const [branches, total] = await this.repo.findAndCount({
            where: { company: { id: companyId }, deleted: false },
            skip: (page - 1) * limit,
            take: limit,
            order: { created_at: 'DESC' },
        });
        return {
            data: branches.map(branch => this.toDomain(branch)),
            total,
        };
    }
    async findById(id, companyId) {
        const branch = await this.repo.findOne({
            where: {
                id,
                company: { id: companyId },
                deleted: false,
            },
        });
        return branch ? this.toDomain(branch) : null;
    }
    async update(branch) {
        await this.repo.update({
            id: branch.id,
            company: { id: branch.companyId },
        }, {
            code: branch.code,
            name: branch.name,
            address: branch.address,
            enabled: branch.enabled,
        });
        const updated = await this.repo.findOne({
            where: {
                id: branch.id,
                company: { id: branch.companyId },
            },
        });
        return this.toDomain(updated);
    }
    toDomain(entity) {
        return new branch_company_entity_1.BranchCompany(entity.id, entity.code, entity.name, entity.address, entity.company?.id, entity.enabled, entity.created_at);
    }
};
exports.BranchCompanyRepositoryImpl = BranchCompanyRepositoryImpl;
exports.BranchCompanyRepositoryImpl = BranchCompanyRepositoryImpl = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(branch_company_orm_entity_1.BranchCompanyOrmEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], BranchCompanyRepositoryImpl);
//# sourceMappingURL=branch.repository.impl.js.map