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
exports.UserCompanyRepositoryImpl = void 0;
const user_company_orm_entity_1 = require("../persistence/user-company.orm-entity");
const user_company_entity_1 = require("../../domain/entities/user-company.entity");
const typeorm_1 = require("@nestjs/typeorm");
const common_1 = require("@nestjs/common");
const typeorm_2 = require("typeorm");
const company_entity_1 = require("../../../company/domain/entities/company.entity");
let UserCompanyRepositoryImpl = class UserCompanyRepositoryImpl {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async create(company) {
        const entity = this.repo.create({
            enabled: company.enabled,
            user: { id: company.usersId },
            company: { id: company.companyId },
        });
        const saved = await this.repo.save(entity);
        return this.toDomain(saved);
    }
    async findByCompany(usersId, page, limit) {
        const query = this.repo
            .createQueryBuilder('userCompany')
            .innerJoinAndSelect('userCompany.company', 'company')
            .andWhere('userCompany.deleted = false');
        if (usersId) {
            query.andWhere('userCompany.user_id = :userId', { userId: usersId });
        }
        const [companies, total] = await query
            .orderBy('userCompany.created_at', 'DESC')
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();
        return { data: companies.map(company => this.toDomain(company)), total };
    }
    async findById(id, usersId) {
        const company = await this.repo.findOne({
            where: {
                id,
                user: { id: usersId },
                deleted: false,
            },
        });
        return company ? this.toDomain(company) : null;
    }
    async update(company) {
        await this.repo.update({
            id: company.id,
            user: { id: company.usersId },
        }, { enabled: company.enabled });
        const updated = await this.repo.findOne({
            where: {
                id: company.id,
                user: { id: company.usersId },
            },
        });
        return this.toDomain(updated);
    }
    toDomain(entity) {
        return new user_company_entity_1.UserCompany(entity.id, entity.user?.id ?? null, entity.company?.id ?? null, entity.enabled, entity.created_at, entity.company
            ? new company_entity_1.Company(entity.company.id, entity.company.ruc, entity.company.description, entity.company.business_name, entity.company.trade_name, entity.company.enabled, entity.company.deleted, entity.company.created_name, entity.company.createdAt, entity.company.createdBy?.id)
            : undefined);
    }
};
exports.UserCompanyRepositoryImpl = UserCompanyRepositoryImpl;
exports.UserCompanyRepositoryImpl = UserCompanyRepositoryImpl = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_company_orm_entity_1.UserCompanyOrmEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UserCompanyRepositoryImpl);
//# sourceMappingURL=user-company.repository.impl.js.map