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
exports.InvoiceDetailOrmEntity = exports.InvoiceOrmEntity = void 0;
const typeorm_1 = require("typeorm");
const company_orm_entity_1 = require("../../../company/infrastructure/persistence/company.orm-entity");
let InvoiceOrmEntity = class InvoiceOrmEntity {
    id;
    company;
    establishment;
    emission_point;
    branch_id;
    branch_address;
    sequential;
    invoice_number;
    issue_date;
    customer_id_type;
    customer_id_number;
    customer_name;
    customer_address;
    customer_email;
    customer_phone;
    payment_method;
    access_key;
    status;
    subtotal_zero_tax;
    subtotal_taxable;
    subtotal;
    discount_total;
    tax_total;
    total;
    notes;
    signed_xml;
    signed_at;
    sign_status;
    sri_status;
    sri_authorization_number;
    sri_authorization_date;
    sri_sent_at;
    sri_messages;
    sri_response_xml;
    created_by;
    enabled;
    deleted;
    details;
    created_at;
};
exports.InvoiceOrmEntity = InvoiceOrmEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], InvoiceOrmEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => company_orm_entity_1.CompanyOrmEntity, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: 'company_id' }),
    __metadata("design:type", company_orm_entity_1.CompanyOrmEntity)
], InvoiceOrmEntity.prototype, "company", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 3, default: '001' }),
    __metadata("design:type", String)
], InvoiceOrmEntity.prototype, "establishment", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 3, default: '001' }),
    __metadata("design:type", String)
], InvoiceOrmEntity.prototype, "emission_point", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], InvoiceOrmEntity.prototype, "branch_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 300, nullable: true }),
    __metadata("design:type", String)
], InvoiceOrmEntity.prototype, "branch_address", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 9 }),
    __metadata("design:type", String)
], InvoiceOrmEntity.prototype, "sequential", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 25 }),
    __metadata("design:type", String)
], InvoiceOrmEntity.prototype, "invoice_number", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", String)
], InvoiceOrmEntity.prototype, "issue_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 2, default: '05' }),
    __metadata("design:type", String)
], InvoiceOrmEntity.prototype, "customer_id_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20 }),
    __metadata("design:type", String)
], InvoiceOrmEntity.prototype, "customer_id_number", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 200 }),
    __metadata("design:type", String)
], InvoiceOrmEntity.prototype, "customer_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 200, nullable: true }),
    __metadata("design:type", String)
], InvoiceOrmEntity.prototype, "customer_address", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], InvoiceOrmEntity.prototype, "customer_email", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 25, nullable: true }),
    __metadata("design:type", String)
], InvoiceOrmEntity.prototype, "customer_phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 2, default: '01' }),
    __metadata("design:type", String)
], InvoiceOrmEntity.prototype, "payment_method", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 49, nullable: true }),
    __metadata("design:type", String)
], InvoiceOrmEntity.prototype, "access_key", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, default: 'ISSUED' }),
    __metadata("design:type", String)
], InvoiceOrmEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)('numeric', { precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], InvoiceOrmEntity.prototype, "subtotal_zero_tax", void 0);
__decorate([
    (0, typeorm_1.Column)('numeric', { precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], InvoiceOrmEntity.prototype, "subtotal_taxable", void 0);
__decorate([
    (0, typeorm_1.Column)('numeric', { precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], InvoiceOrmEntity.prototype, "subtotal", void 0);
__decorate([
    (0, typeorm_1.Column)('numeric', { precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], InvoiceOrmEntity.prototype, "discount_total", void 0);
__decorate([
    (0, typeorm_1.Column)('numeric', { precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], InvoiceOrmEntity.prototype, "tax_total", void 0);
__decorate([
    (0, typeorm_1.Column)('numeric', { precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], InvoiceOrmEntity.prototype, "total", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], InvoiceOrmEntity.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true, select: false }),
    __metadata("design:type", String)
], InvoiceOrmEntity.prototype, "signed_xml", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], InvoiceOrmEntity.prototype, "signed_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, default: 'NOT_SIGNED' }),
    __metadata("design:type", String)
], InvoiceOrmEntity.prototype, "sign_status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, default: 'NOT_SENT' }),
    __metadata("design:type", String)
], InvoiceOrmEntity.prototype, "sri_status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 49, nullable: true }),
    __metadata("design:type", String)
], InvoiceOrmEntity.prototype, "sri_authorization_number", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], InvoiceOrmEntity.prototype, "sri_authorization_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], InvoiceOrmEntity.prototype, "sri_sent_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Array)
], InvoiceOrmEntity.prototype, "sri_messages", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true, select: false }),
    __metadata("design:type", String)
], InvoiceOrmEntity.prototype, "sri_response_xml", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], InvoiceOrmEntity.prototype, "created_by", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], InvoiceOrmEntity.prototype, "enabled", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], InvoiceOrmEntity.prototype, "deleted", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => InvoiceDetailOrmEntity, (d) => d.invoice, { cascade: true }),
    __metadata("design:type", Array)
], InvoiceOrmEntity.prototype, "details", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], InvoiceOrmEntity.prototype, "created_at", void 0);
exports.InvoiceOrmEntity = InvoiceOrmEntity = __decorate([
    (0, typeorm_1.Index)(['company', 'invoice_number'], { unique: true }),
    (0, typeorm_1.Entity)('tab_invoice')
], InvoiceOrmEntity);
let InvoiceDetailOrmEntity = class InvoiceDetailOrmEntity {
    id;
    invoice;
    item_type;
    item_id;
    code;
    description;
    quantity;
    unit_price;
    discount;
    tax_rate;
    tax_value;
    subtotal;
    total;
};
exports.InvoiceDetailOrmEntity = InvoiceDetailOrmEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], InvoiceDetailOrmEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => InvoiceOrmEntity, (inv) => inv.details, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'invoice_id' }),
    __metadata("design:type", InvoiceOrmEntity)
], InvoiceDetailOrmEntity.prototype, "invoice", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, nullable: true }),
    __metadata("design:type", String)
], InvoiceDetailOrmEntity.prototype, "item_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], InvoiceDetailOrmEntity.prototype, "item_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 30, nullable: true }),
    __metadata("design:type", String)
], InvoiceDetailOrmEntity.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 250 }),
    __metadata("design:type", String)
], InvoiceDetailOrmEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)('numeric', { precision: 12, scale: 4, default: 1 }),
    __metadata("design:type", Number)
], InvoiceDetailOrmEntity.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)('numeric', { precision: 12, scale: 4, default: 0 }),
    __metadata("design:type", Number)
], InvoiceDetailOrmEntity.prototype, "unit_price", void 0);
__decorate([
    (0, typeorm_1.Column)('numeric', { precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], InvoiceDetailOrmEntity.prototype, "discount", void 0);
__decorate([
    (0, typeorm_1.Column)('numeric', { precision: 5, scale: 2, default: 15 }),
    __metadata("design:type", Number)
], InvoiceDetailOrmEntity.prototype, "tax_rate", void 0);
__decorate([
    (0, typeorm_1.Column)('numeric', { precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], InvoiceDetailOrmEntity.prototype, "tax_value", void 0);
__decorate([
    (0, typeorm_1.Column)('numeric', { precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], InvoiceDetailOrmEntity.prototype, "subtotal", void 0);
__decorate([
    (0, typeorm_1.Column)('numeric', { precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], InvoiceDetailOrmEntity.prototype, "total", void 0);
exports.InvoiceDetailOrmEntity = InvoiceDetailOrmEntity = __decorate([
    (0, typeorm_1.Entity)('tab_invoice_detail')
], InvoiceDetailOrmEntity);
//# sourceMappingURL=invoice.orm-entity.js.map