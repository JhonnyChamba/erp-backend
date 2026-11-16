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
exports.SubscriptionsModuleOrmEntity = void 0;
const typeorm_1 = require("typeorm");
const module_orm_entity_1 = require("../../../module/infrastructure/persistence/module.orm-entity");
const sub_module_orm_entity_1 = require("../../../sub-module/infrastructure/persistence/sub-module.orm-entity");
const subscriptions_orm_entity_1 = require("../../../subscriptions/infrastructure/persistence/subscriptions.orm-entity");
let SubscriptionsModuleOrmEntity = class SubscriptionsModuleOrmEntity {
    id;
    subscriptions;
    module;
    subModule;
    enabled;
    deleted;
    created_at;
};
exports.SubscriptionsModuleOrmEntity = SubscriptionsModuleOrmEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], SubscriptionsModuleOrmEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => subscriptions_orm_entity_1.SubscriptionsOrmEntity, (sub) => sub.subscriptionModules, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'subscriptions_id' }),
    __metadata("design:type", subscriptions_orm_entity_1.SubscriptionsOrmEntity)
], SubscriptionsModuleOrmEntity.prototype, "subscriptions", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => module_orm_entity_1.ModuleOrmEntity, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'module_id' }),
    __metadata("design:type", module_orm_entity_1.ModuleOrmEntity)
], SubscriptionsModuleOrmEntity.prototype, "module", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => sub_module_orm_entity_1.subModulesOrmEntity, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'sub_module_id' }),
    __metadata("design:type", sub_module_orm_entity_1.subModulesOrmEntity)
], SubscriptionsModuleOrmEntity.prototype, "subModule", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], SubscriptionsModuleOrmEntity.prototype, "enabled", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], SubscriptionsModuleOrmEntity.prototype, "deleted", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], SubscriptionsModuleOrmEntity.prototype, "created_at", void 0);
exports.SubscriptionsModuleOrmEntity = SubscriptionsModuleOrmEntity = __decorate([
    (0, typeorm_1.Entity)('tab_subscription_module')
], SubscriptionsModuleOrmEntity);
//# sourceMappingURL=subscriptions-module.orm-entity.js.map