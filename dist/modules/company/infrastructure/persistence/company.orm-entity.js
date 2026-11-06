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
exports.CompanyOrmEntity = void 0;
const users_orm_entity_1 = require("../../../users/infrastructure/persistence/users.orm-entity");
const typeorm_1 = require("typeorm");
let CompanyOrmEntity = class CompanyOrmEntity {
    id;
    ruc;
    description;
    business_name;
    trade_name;
    enabled;
    deleted;
    createdBy;
    created_name;
    createdAt;
    updatedBy;
    update_name;
    updatedAt;
    deletedBy;
    deleted_name;
    deletedAt;
};
exports.CompanyOrmEntity = CompanyOrmEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], CompanyOrmEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CompanyOrmEntity.prototype, "ruc", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CompanyOrmEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CompanyOrmEntity.prototype, "business_name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CompanyOrmEntity.prototype, "trade_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], CompanyOrmEntity.prototype, "enabled", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], CompanyOrmEntity.prototype, "deleted", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => users_orm_entity_1.UsersOrmEntity, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'created_by' }),
    __metadata("design:type", users_orm_entity_1.UsersOrmEntity)
], CompanyOrmEntity.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], CompanyOrmEntity.prototype, "created_name", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], CompanyOrmEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => users_orm_entity_1.UsersOrmEntity, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'updated_by' }),
    __metadata("design:type", users_orm_entity_1.UsersOrmEntity)
], CompanyOrmEntity.prototype, "updatedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], CompanyOrmEntity.prototype, "update_name", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at', nullable: true }),
    __metadata("design:type", Date)
], CompanyOrmEntity.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => users_orm_entity_1.UsersOrmEntity, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'deleted_by' }),
    __metadata("design:type", users_orm_entity_1.UsersOrmEntity)
], CompanyOrmEntity.prototype, "deletedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], CompanyOrmEntity.prototype, "deleted_name", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)({ name: 'deleted_at' }),
    __metadata("design:type", Date)
], CompanyOrmEntity.prototype, "deletedAt", void 0);
exports.CompanyOrmEntity = CompanyOrmEntity = __decorate([
    (0, typeorm_1.Entity)('tab_company')
], CompanyOrmEntity);
//# sourceMappingURL=company.orm-entity.js.map