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
exports.PlansOrmEntity = void 0;
const enum_1 = require("../../../../common/enum/enum");
const users_orm_entity_1 = require("../../../users/infrastructure/persistence/users.orm-entity");
const typeorm_1 = require("typeorm");
let PlansOrmEntity = class PlansOrmEntity {
    id;
    price;
    billing_cycle;
    description;
    max_users;
    max_branches;
    enabled;
    createdBy;
    created_name;
    createdAt;
    updatedBy;
    update_name;
    updatedAt;
};
exports.PlansOrmEntity = PlansOrmEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], PlansOrmEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'numeric', precision: 10, scale: 2 }),
    __metadata("design:type", String)
], PlansOrmEntity.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: enum_1.BillingCycleGeneral, default: enum_1.BillingCycleGeneral.MONTHLY }),
    __metadata("design:type", String)
], PlansOrmEntity.prototype, "billing_cycle", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PlansOrmEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], PlansOrmEntity.prototype, "max_users", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], PlansOrmEntity.prototype, "max_branches", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], PlansOrmEntity.prototype, "enabled", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => users_orm_entity_1.UsersOrmEntity, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'created_by' }),
    __metadata("design:type", users_orm_entity_1.UsersOrmEntity)
], PlansOrmEntity.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], PlansOrmEntity.prototype, "created_name", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], PlansOrmEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => users_orm_entity_1.UsersOrmEntity, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'updated_by' }),
    __metadata("design:type", users_orm_entity_1.UsersOrmEntity)
], PlansOrmEntity.prototype, "updatedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], PlansOrmEntity.prototype, "update_name", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at', nullable: true }),
    __metadata("design:type", Date)
], PlansOrmEntity.prototype, "updatedAt", void 0);
exports.PlansOrmEntity = PlansOrmEntity = __decorate([
    (0, typeorm_1.Entity)('tab_plans')
], PlansOrmEntity);
//# sourceMappingURL=plans.orm-entity.js.map