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
exports.PurchaseDetailOrmEntity = exports.PurchaseOrmEntity = void 0;
const typeorm_1 = require("typeorm");
const company_orm_entity_1 = require("../../../company/infrastructure/persistence/company.orm-entity");
let PurchaseOrmEntity = class PurchaseOrmEntity {
    id;
    company;
    provider_id;
    provider_name;
    provider_id_type;
    provider_id_number;
    provider_email;
    provider_phone;
    provider_address;
    establishment;
    emission_point;
    sequential;
    invoice_number;
    authorization_number;
    issue_date;
    warehouse_id;
    warehouse_name;
    branch_id;
    payment_method;
    notes;
    status;
    subtotal_zero_tax;
    subtotal_taxed;
    tax_value;
    total;
    details;
    created_by;
    created_at;
    updated_at;
};
exports.PurchaseOrmEntity = PurchaseOrmEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], PurchaseOrmEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => company_orm_entity_1.CompanyOrmEntity, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: 'company_id' }),
    __metadata("design:type", company_orm_entity_1.CompanyOrmEntity)
], PurchaseOrmEntity.prototype, "company", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], PurchaseOrmEntity.prototype, "provider_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 200 }),
    __metadata("design:type", String)
], PurchaseOrmEntity.prototype, "provider_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 2, default: '04' }),
    __metadata("design:type", String)
], PurchaseOrmEntity.prototype, "provider_id_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20 }),
    __metadata("design:type", String)
], PurchaseOrmEntity.prototype, "provider_id_number", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 150, nullable: true }),
    __metadata("design:type", String)
], PurchaseOrmEntity.prototype, "provider_email", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 30, nullable: true }),
    __metadata("design:type", String)
], PurchaseOrmEntity.prototype, "provider_phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 250, nullable: true }),
    __metadata("design:type", String)
], PurchaseOrmEntity.prototype, "provider_address", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 3, default: '001' }),
    __metadata("design:type", String)
], PurchaseOrmEntity.prototype, "establishment", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 3, default: '001' }),
    __metadata("design:type", String)
], PurchaseOrmEntity.prototype, "emission_point", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 9 }),
    __metadata("design:type", String)
], PurchaseOrmEntity.prototype, "sequential", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 25 }),
    __metadata("design:type", String)
], PurchaseOrmEntity.prototype, "invoice_number", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 49, nullable: true }),
    __metadata("design:type", String)
], PurchaseOrmEntity.prototype, "authorization_number", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", String)
], PurchaseOrmEntity.prototype, "issue_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], PurchaseOrmEntity.prototype, "warehouse_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 150, default: 'Bodega Principal' }),
    __metadata("design:type", String)
], PurchaseOrmEntity.prototype, "warehouse_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], PurchaseOrmEntity.prototype, "branch_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 25, default: 'contado' }),
    __metadata("design:type", String)
], PurchaseOrmEntity.prototype, "payment_method", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], PurchaseOrmEntity.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, default: 'COMPLETED' }),
    __metadata("design:type", String)
], PurchaseOrmEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)('numeric', { precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], PurchaseOrmEntity.prototype, "subtotal_zero_tax", void 0);
__decorate([
    (0, typeorm_1.Column)('numeric', { precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], PurchaseOrmEntity.prototype, "subtotal_taxed", void 0);
__decorate([
    (0, typeorm_1.Column)('numeric', { precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], PurchaseOrmEntity.prototype, "tax_value", void 0);
__decorate([
    (0, typeorm_1.Column)('numeric', { precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], PurchaseOrmEntity.prototype, "total", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => PurchaseDetailOrmEntity, (d) => d.purchase, { cascade: true }),
    __metadata("design:type", Array)
], PurchaseOrmEntity.prototype, "details", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], PurchaseOrmEntity.prototype, "created_by", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], PurchaseOrmEntity.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], PurchaseOrmEntity.prototype, "updated_at", void 0);
exports.PurchaseOrmEntity = PurchaseOrmEntity = __decorate([
    (0, typeorm_1.Index)(['company', 'invoice_number'], { unique: false }),
    (0, typeorm_1.Entity)('tab_purchase')
], PurchaseOrmEntity);
let PurchaseDetailOrmEntity = class PurchaseDetailOrmEntity {
    id;
    purchase;
    item_type;
    item_id;
    code;
    description;
    unit;
    quantity;
    unit_cost;
    tax_rate;
    tax_value;
    subtotal;
    total;
};
exports.PurchaseDetailOrmEntity = PurchaseDetailOrmEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], PurchaseDetailOrmEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => PurchaseOrmEntity, (p) => p.details, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'purchase_id' }),
    __metadata("design:type", PurchaseOrmEntity)
], PurchaseDetailOrmEntity.prototype, "purchase", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, default: 'PRODUCT' }),
    __metadata("design:type", String)
], PurchaseDetailOrmEntity.prototype, "item_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], PurchaseDetailOrmEntity.prototype, "item_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, default: '' }),
    __metadata("design:type", String)
], PurchaseDetailOrmEntity.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 250 }),
    __metadata("design:type", String)
], PurchaseDetailOrmEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, default: 'UND' }),
    __metadata("design:type", String)
], PurchaseDetailOrmEntity.prototype, "unit", void 0);
__decorate([
    (0, typeorm_1.Column)('numeric', { precision: 14, scale: 4, default: 1 }),
    __metadata("design:type", Number)
], PurchaseDetailOrmEntity.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)('numeric', { precision: 14, scale: 4, default: 0 }),
    __metadata("design:type", Number)
], PurchaseDetailOrmEntity.prototype, "unit_cost", void 0);
__decorate([
    (0, typeorm_1.Column)('numeric', { precision: 5, scale: 2, default: 15 }),
    __metadata("design:type", Number)
], PurchaseDetailOrmEntity.prototype, "tax_rate", void 0);
__decorate([
    (0, typeorm_1.Column)('numeric', { precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], PurchaseDetailOrmEntity.prototype, "tax_value", void 0);
__decorate([
    (0, typeorm_1.Column)('numeric', { precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], PurchaseDetailOrmEntity.prototype, "subtotal", void 0);
__decorate([
    (0, typeorm_1.Column)('numeric', { precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], PurchaseDetailOrmEntity.prototype, "total", void 0);
exports.PurchaseDetailOrmEntity = PurchaseDetailOrmEntity = __decorate([
    (0, typeorm_1.Entity)('tab_purchase_detail')
], PurchaseDetailOrmEntity);
//# sourceMappingURL=purchase.orm-entity.js.map