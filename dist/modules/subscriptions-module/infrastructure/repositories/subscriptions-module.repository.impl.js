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
exports.SubscriptionsModuleRepositoryImpl = void 0;
const subscriptions_module_orm_entity_1 = require("../persistence/subscriptions-module.orm-entity");
const subscriptions_module_entity_1 = require("../../domain/entities/subscriptions-module.entity");
const typeorm_1 = require("@nestjs/typeorm");
const common_1 = require("@nestjs/common");
const typeorm_2 = require("typeorm");
let SubscriptionsModuleRepositoryImpl = class SubscriptionsModuleRepositoryImpl {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async create(subModule) {
        const entity = this.repo.create({
            subscriptions: { id: subModule.subscriptionId },
            module: { id: subModule.moduleId },
        });
        const saved = await this.repo.save(entity);
        return this.toDomain(saved);
    }
    async findByCompany(subscriptionId, page, limit) {
        const [subscriptionsModule, total] = await this.repo.findAndCount({
            where: { subscriptions: { id: subscriptionId } },
            skip: (page - 1) * limit,
            take: limit,
            order: { created_at: 'DESC' },
        });
        return {
            data: subscriptionsModule.map(subModule => this.toDomain(subModule)),
            total,
        };
    }
    async findById(id, subscriptionId) {
        const subModule = await this.repo.findOne({ where: { id, subscriptions: { id: subscriptionId } } });
        return subModule ? this.toDomain(subModule) : null;
    }
    async update(subModule) {
        await this.repo.update({ id: subModule.id, subscriptions: { id: subModule.subscriptionId } }, { module: { id: subModule.moduleId } });
        const updated = await this.repo.findOne({
            where: {
                id: subModule.id,
                subscriptions: { id: subModule.subscriptionId },
            },
        });
        return this.toDomain(updated);
    }
    toDomain(entity) {
        return new subscriptions_module_entity_1.SubscriptionsModule(entity.id, entity.subscriptions?.id, entity.module?.id);
    }
};
exports.SubscriptionsModuleRepositoryImpl = SubscriptionsModuleRepositoryImpl;
exports.SubscriptionsModuleRepositoryImpl = SubscriptionsModuleRepositoryImpl = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(subscriptions_module_orm_entity_1.SubscriptionsModuleOrmEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], SubscriptionsModuleRepositoryImpl);
//# sourceMappingURL=subscriptions-module.repository.impl.js.map