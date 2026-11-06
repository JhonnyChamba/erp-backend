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
const subscriptions_module_orm_entity_1 = require("../../../subscriptions-module/infrastructure/persistence/subscriptions-module.orm-entity");
const subscriptions_entity_1 = require("../../domain/entities/subscriptions.entity");
const typeorm_1 = require("@nestjs/typeorm");
const common_1 = require("@nestjs/common");
const typeorm_2 = require("typeorm");
let SubscriptionsRepositoryImpl = class SubscriptionsRepositoryImpl {
    repo;
    subModuleRepo;
    constructor(repo, subModuleRepo) {
        this.repo = repo;
        this.subModuleRepo = subModuleRepo;
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
        if ((subscriptions.moduleIds && subscriptions.moduleIds.length > 0) ||
            (subscriptions.subModuleIds && subscriptions.subModuleIds.length > 0)) {
            await this.syncSubscriptionAccess(saved.id, subscriptions.moduleIds || [], subscriptions.subModuleIds || []);
        }
        const full = await this.findById(saved.id, subscriptions.companyId);
        return full || this.toDomain(saved);
    }
    async findByCompany(companyId, page, limit) {
        const [subscriptionses, total] = await this.repo.findAndCount({
            where: { company: { id: companyId }, deleted: false },
            relations: ['plan', 'company', 'subscriptionModules', 'subscriptionModules.module', 'subscriptionModules.subModule'],
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
        const whereClause = { id, deleted: false };
        if (companyId) {
            whereClause.company = { id: companyId };
        }
        const subscriptions = await this.repo.findOne({
            where: whereClause,
            relations: ['plan', 'company', 'subscriptionModules', 'subscriptionModules.module', 'subscriptionModules.subModule'],
        });
        return subscriptions ? this.toDomain(subscriptions) : null;
    }
    async update(subscriptions) {
        const whereClause = { id: subscriptions.id };
        if (subscriptions.companyId) {
            whereClause.company = { id: subscriptions.companyId };
        }
        await this.repo.update(whereClause, {
            plan: subscriptions.planId ? { id: subscriptions.planId } : undefined,
            begin_date: subscriptions.begin_date,
            end_date: subscriptions.end_date,
            enabled: subscriptions.enabled,
        });
        if (subscriptions.moduleIds !== undefined || subscriptions.subModuleIds !== undefined) {
            await this.syncSubscriptionAccess(subscriptions.id, subscriptions.moduleIds || [], subscriptions.subModuleIds || []);
        }
        const updated = await this.findById(subscriptions.id, subscriptions.companyId);
        return updated;
    }
    async syncSubscriptionAccess(subscriptionId, moduleIds, subModuleIds) {
        const targetModIds = Array.from(new Set((moduleIds || []).map(Number).filter((id) => !isNaN(id) && id > 0)));
        const targetSubModIds = Array.from(new Set((subModuleIds || []).map(Number).filter((id) => !isNaN(id) && id > 0)));
        await this.subModuleRepo
            .createQueryBuilder()
            .update(subscriptions_module_orm_entity_1.SubscriptionsModuleOrmEntity)
            .set({ deleted: true, enabled: false })
            .where('subscriptions_id = :subscriptionId', { subscriptionId })
            .execute();
        for (const modId of targetModIds) {
            const entity = this.subModuleRepo.create({
                subscriptions: { id: subscriptionId },
                module: { id: modId },
                subModule: null,
                enabled: true,
                deleted: false,
            });
            await this.subModuleRepo.save(entity);
        }
        for (const subModId of targetSubModIds) {
            const entity = this.subModuleRepo.create({
                subscriptions: { id: subscriptionId },
                module: null,
                subModule: { id: subModId },
                enabled: true,
                deleted: false,
            });
            await this.subModuleRepo.save(entity);
        }
    }
    toDomain(entity) {
        const activeItems = (entity.subscriptionModules || []).filter((sm) => !sm.deleted && sm.enabled !== false);
        const moduleIds = Array.from(new Set(activeItems
            .filter((sm) => sm.module?.id)
            .map((sm) => Number(sm.module.id))));
        const subModuleIds = Array.from(new Set(activeItems
            .filter((sm) => sm.subModule?.id)
            .map((sm) => Number(sm.subModule.id))));
        return new subscriptions_entity_1.Subscriptions(entity.id, entity.begin_date, entity.end_date, entity.plan?.id, entity.company?.id, entity.enabled, entity.created_at, entity.created_by, moduleIds, subModuleIds);
    }
};
exports.SubscriptionsRepositoryImpl = SubscriptionsRepositoryImpl;
exports.SubscriptionsRepositoryImpl = SubscriptionsRepositoryImpl = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(subscriptions_orm_entity_1.SubscriptionsOrmEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(subscriptions_module_orm_entity_1.SubscriptionsModuleOrmEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], SubscriptionsRepositoryImpl);
//# sourceMappingURL=subscriptions.repository.impl.js.map