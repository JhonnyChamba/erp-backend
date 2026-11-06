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
exports.SubscriptionsRepositoryImpl = void 0;
const subscriptions_orm_entity_1 = require("../persistence/subscriptions.orm-entity");
const subscriptions_entity_1 = require("../../domain/entities/subscriptions.entity");
const typeorm_1 = require("@nestjs/typeorm");
const common_1 = require("@nestjs/common");
const typeorm_2 = require("typeorm");
let SubscriptionsRepositoryImpl = class SubscriptionsRepositoryImpl {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async create(subscriptions) {
        const entity = this.repo.create({
            begin_date: subscriptions.begin_date,
            end_date: subscriptions.end_date,
            enabled: subscriptions.enabled,
            plan: { id: subscriptions.planId },
            company: { id: subscriptions.companyId },
            createdBy: { id: subscriptions.createdById }
        });
        const saved = await this.repo.save(entity);
        return this.toDomain(saved);
    }
    async findByCompany(companyId, page, limit) {
        const [subscriptionses, total] = await this.repo.findAndCount({
            where: { company: { id: companyId }, deleted: false },
            skip: (page - 1) * limit,
            take: limit,
            order: { created_at: 'DESC' },
        });
        return {
            data: subscriptionses.map(subscriptions => this.toDomain(subscriptions)),
            total,
        };
    }
    async findById(id, companyId) {
        const subscriptions = await this.repo.findOne({
            where: {
                id,
                company: { id: companyId },
                deleted: false,
            },
        });
        return subscriptions ? this.toDomain(subscriptions) : null;
    }
    async update(subscriptions) {
        await this.repo.update({
            id: subscriptions.id,
            company: { id: subscriptions.companyId },
        }, {
            begin_date: subscriptions.begin_date,
            end_date: subscriptions.end_date,
            enabled: subscriptions.enabled,
        });
        const updated = await this.repo.findOne({
            where: {
                id: subscriptions.id,
                company: { id: subscriptions.companyId },
            },
        });
        return this.toDomain(updated);
    }
    toDomain(entity) {
        return new subscriptions_entity_1.Subscriptions(entity.id, entity.begin_date, entity.end_date, entity.plan?.id, entity.company?.id, entity.enabled, entity.created_at);
    }
};
exports.SubscriptionsRepositoryImpl = SubscriptionsRepositoryImpl;
exports.SubscriptionsRepositoryImpl = SubscriptionsRepositoryImpl = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(subscriptions_orm_entity_1.SubscriptionsOrmEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], SubscriptionsRepositoryImpl);
//# sourceMappingURL=subscriptions.repository.impl.js.map