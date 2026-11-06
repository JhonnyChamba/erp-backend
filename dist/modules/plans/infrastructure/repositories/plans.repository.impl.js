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
const typeorm_1 = require("@nestjs/typeorm");
const common_1 = require("@nestjs/common");
const typeorm_2 = require("typeorm");
let PlansRepositoryImpl = class PlansRepositoryImpl {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async create(company) {
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
        return this.toDomain(saved);
    }
    async findByPlans(page, limit) {
        const [branches, total] = await this.repo.findAndCount({
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
        const company = await this.repo.findOne({ where: { id } });
        return company ? this.toDomain(company) : null;
    }
    async update(company) {
        await this.repo.update({ id: company.id }, {
            price: company.price,
            billing_cycle: company.billing_cycle,
            description: company.description,
            max_users: company.max_users,
            max_branches: company.max_branches,
            enabled: company.enabled,
        });
        const updated = await this.repo.findOne({ where: { id: company.id } });
        return this.toDomain(updated);
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