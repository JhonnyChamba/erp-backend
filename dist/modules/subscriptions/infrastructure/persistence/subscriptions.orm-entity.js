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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionsOrmEntity = void 0;
const typeorm_1 = require("typeorm");
const company_orm_entity_1 = require("../../../company/infrastructure/persistence/company.orm-entity");
const plans_orm_entity_1 = require("../../../plans/infrastructure/persistence/plans.orm-entity");
const users_orm_entity_1 = require("../../../users/infrastructure/persistence/users.orm-entity");
const subscriptions_module_orm_entity_1 = require("../../../subscriptions-module/infrastructure/persistence/subscriptions-module.orm-entity");
let SubscriptionsOrmEntity = class SubscriptionsOrmEntity {
    id;
    company;
    plan;
    subscriptionModules;
    begin_date;
    end_date;
    createdBy;
    created_by;
    enabled;
    deleted;
    created_at;
};
exports.SubscriptionsOrmEntity = SubscriptionsOrmEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], SubscriptionsOrmEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => company_orm_entity_1.CompanyOrmEntity, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: 'company_id' }),
    __metadata("design:type", company_orm_entity_1.CompanyOrmEntity)
], SubscriptionsOrmEntity.prototype, "company", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => plans_orm_entity_1.PlansOrmEntity, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: 'plan_id' }),
    __metadata("design:type", plans_orm_entity_1.PlansOrmEntity)
], SubscriptionsOrmEntity.prototype, "plan", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => subscriptions_module_orm_entity_1.SubscriptionsModuleOrmEntity, (sm) => sm.subscriptions),
    __metadata("design:type", Array)
], SubscriptionsOrmEntity.prototype, "subscriptionModules", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], SubscriptionsOrmEntity.prototype, "begin_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], SubscriptionsOrmEntity.prototype, "end_date", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => users_orm_entity_1.UsersOrmEntity, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: 'created_by' }),
    __metadata("design:type", users_orm_entity_1.UsersOrmEntity)
], SubscriptionsOrmEntity.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], SubscriptionsOrmEntity.prototype, "created_by", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], SubscriptionsOrmEntity.prototype, "enabled", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], SubscriptionsOrmEntity.prototype, "deleted", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], SubscriptionsOrmEntity.prototype, "created_at", void 0);
exports.SubscriptionsOrmEntity = SubscriptionsOrmEntity = __decorate([
    (0, typeorm_1.Entity)('tab_subscriptions')
], SubscriptionsOrmEntity);
//# sourceMappingURL=subscriptions.orm-entity.js.map