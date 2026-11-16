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
exports.TaxOrmEntity = void 0;
const typeorm_1 = require("typeorm");
const company_orm_entity_1 = require("../../../company/infrastructure/persistence/company.orm-entity");
let TaxOrmEntity = class TaxOrmEntity {
    id;
    company_id;
    company;
    code;
    percentage;
    description;
    status;
    is_default;
    deleted;
    created_at;
    updated_at;
};
exports.TaxOrmEntity = TaxOrmEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], TaxOrmEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'company_id' }),
    __metadata("design:type", Number)
], TaxOrmEntity.prototype, "company_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => company_orm_entity_1.CompanyOrmEntity, { nullable: false, onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'company_id' }),
    __metadata("design:type", company_orm_entity_1.CompanyOrmEntity)
], TaxOrmEntity.prototype, "company", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50 }),
    __metadata("design:type", String)
], TaxOrmEntity.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)('numeric', { precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], TaxOrmEntity.prototype, "percentage", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 250 }),
    __metadata("design:type", String)
], TaxOrmEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, default: 'ACTIVO' }),
    __metadata("design:type", String)
], TaxOrmEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_default', default: false }),
    __metadata("design:type", Boolean)
], TaxOrmEntity.prototype, "is_default", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], TaxOrmEntity.prototype, "deleted", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], TaxOrmEntity.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], TaxOrmEntity.prototype, "updated_at", void 0);
exports.TaxOrmEntity = TaxOrmEntity = __decorate([
    (0, typeorm_1.Index)(['company_id', 'code'], { unique: true, where: '"deleted" = false' }),
    (0, typeorm_1.Entity)('tab_taxes')
], TaxOrmEntity);
//# sourceMappingURL=tax.orm-entity.js.map