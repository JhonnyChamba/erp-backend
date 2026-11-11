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
exports.CreditNoteDetailOrmEntity = exports.CreditNoteOrmEntity = void 0;
const typeorm_1 = require("typeorm");
const company_orm_entity_1 = require("../../../company/infrastructure/persistence/company.orm-entity");
const invoice_orm_entity_1 = require("./invoice.orm-entity");
let CreditNoteOrmEntity = class CreditNoteOrmEntity {
    id;
    company;
    invoice;
    branch_id;
    branch_address;
    establishment;
    emission_point;
    sequential;
    credit_note_number;
    issue_date;
    modified_document_type;
    modified_document_number;
    modified_document_date;
    reason;
    customer_id_type;
    customer_id_number;
    customer_name;
    customer_address;
    customer_email;
    customer_phone;
    access_key;
    status;
    subtotal_zero_tax;
    subtotal_taxable;
    subtotal;
    discount_total;
    tax_total;
    total;
    adjust_inventory;
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
    updated_at;
};
exports.CreditNoteOrmEntity = CreditNoteOrmEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], CreditNoteOrmEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => company_orm_entity_1.CompanyOrmEntity, { nullable: false, onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'company_id' }),
    __metadata("design:type", company_orm_entity_1.CompanyOrmEntity)
], CreditNoteOrmEntity.prototype, "company", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => invoice_orm_entity_1.InvoiceOrmEntity, { nullable: true, onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'invoice_id' }),
    __metadata("design:type", invoice_orm_entity_1.InvoiceOrmEntity)
], CreditNoteOrmEntity.prototype, "invoice", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], CreditNoteOrmEntity.prototype, "branch_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 300, nullable: true }),
    __metadata("design:type", String)
], CreditNoteOrmEntity.prototype, "branch_address", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 3, default: '001' }),
    __metadata("design:type", String)
], CreditNoteOrmEntity.prototype, "establishment", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 3, default: '001' }),
    __metadata("design:type", String)
], CreditNoteOrmEntity.prototype, "emission_point", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 9 }),
    __metadata("design:type", String)
], CreditNoteOrmEntity.prototype, "sequential", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 25 }),
    __metadata("design:type", String)
], CreditNoteOrmEntity.prototype, "credit_note_number", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", String)
], CreditNoteOrmEntity.prototype, "issue_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 2, default: '01' }),
    __metadata("design:type", String)
], CreditNoteOrmEntity.prototype, "modified_document_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 25 }),
    __metadata("design:type", String)
], CreditNoteOrmEntity.prototype, "modified_document_number", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", String)
], CreditNoteOrmEntity.prototype, "modified_document_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 300 }),
    __metadata("design:type", String)
], CreditNoteOrmEntity.prototype, "reason", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 2, default: '05' }),
    __metadata("design:type", String)
], CreditNoteOrmEntity.prototype, "customer_id_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20 }),
    __metadata("design:type", String)
], CreditNoteOrmEntity.prototype, "customer_id_number", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 200 }),
    __metadata("design:type", String)
], CreditNoteOrmEntity.prototype, "customer_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 200, nullable: true }),
    __metadata("design:type", String)
], CreditNoteOrmEntity.prototype, "customer_address", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], CreditNoteOrmEntity.prototype, "customer_email", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 25, nullable: true }),
    __metadata("design:type", String)
], CreditNoteOrmEntity.prototype, "customer_phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 49, nullable: true }),
    __metadata("design:type", String)
], CreditNoteOrmEntity.prototype, "access_key", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, default: 'ISSUED' }),
    __metadata("design:type", String)
], CreditNoteOrmEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)('numeric', { precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], CreditNoteOrmEntity.prototype, "subtotal_zero_tax", void 0);
__decorate([
    (0, typeorm_1.Column)('numeric', { precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], CreditNoteOrmEntity.prototype, "subtotal_taxable", void 0);
__decorate([
    (0, typeorm_1.Column)('numeric', { precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], CreditNoteOrmEntity.prototype, "subtotal", void 0);
__decorate([
    (0, typeorm_1.Column)('numeric', { precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], CreditNoteOrmEntity.prototype, "discount_total", void 0);
__decorate([
    (0, typeorm_1.Column)('numeric', { precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], CreditNoteOrmEntity.prototype, "tax_total", void 0);
__decorate([
    (0, typeorm_1.Column)('numeric', { precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], CreditNoteOrmEntity.prototype, "total", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], CreditNoteOrmEntity.prototype, "adjust_inventory", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], CreditNoteOrmEntity.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true, select: false }),
    __metadata("design:type", String)
], CreditNoteOrmEntity.prototype, "signed_xml", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], CreditNoteOrmEntity.prototype, "signed_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, default: 'NOT_SIGNED' }),
    __metadata("design:type", String)
], CreditNoteOrmEntity.prototype, "sign_status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, default: 'NOT_SENT' }),
    __metadata("design:type", String)
], CreditNoteOrmEntity.prototype, "sri_status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 49, nullable: true }),
    __metadata("design:type", String)
], CreditNoteOrmEntity.prototype, "sri_authorization_number", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], CreditNoteOrmEntity.prototype, "sri_authorization_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], CreditNoteOrmEntity.prototype, "sri_sent_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Array)
], CreditNoteOrmEntity.prototype, "sri_messages", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true, select: false }),
    __metadata("design:type", String)
], CreditNoteOrmEntity.prototype, "sri_response_xml", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], CreditNoteOrmEntity.prototype, "created_by", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], CreditNoteOrmEntity.prototype, "enabled", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], CreditNoteOrmEntity.prototype, "deleted", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => CreditNoteDetailOrmEntity, (d) => d.credit_note, { cascade: true }),
    __metadata("design:type", Array)
], CreditNoteOrmEntity.prototype, "details", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], CreditNoteOrmEntity.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], CreditNoteOrmEntity.prototype, "updated_at", void 0);
exports.CreditNoteOrmEntity = CreditNoteOrmEntity = __decorate([
    (0, typeorm_1.Index)(['company', 'credit_note_number'], { unique: true }),
    (0, typeorm_1.Entity)('tab_credit_note')
], CreditNoteOrmEntity);
let CreditNoteDetailOrmEntity = class CreditNoteDetailOrmEntity {
    id;
    credit_note;
    item_type;
    item_id;
    warehouse_id;
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
exports.CreditNoteDetailOrmEntity = CreditNoteDetailOrmEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], CreditNoteDetailOrmEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => CreditNoteOrmEntity, (cn) => cn.details, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'credit_note_id' }),
    __metadata("design:type", CreditNoteOrmEntity)
], CreditNoteDetailOrmEntity.prototype, "credit_note", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, default: 'PRODUCT' }),
    __metadata("design:type", String)
], CreditNoteDetailOrmEntity.prototype, "item_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], CreditNoteDetailOrmEntity.prototype, "item_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], CreditNoteDetailOrmEntity.prototype, "warehouse_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 30, nullable: true }),
    __metadata("design:type", String)
], CreditNoteDetailOrmEntity.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 250 }),
    __metadata("design:type", String)
], CreditNoteDetailOrmEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)('numeric', { precision: 12, scale: 4, default: 1 }),
    __metadata("design:type", Number)
], CreditNoteDetailOrmEntity.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)('numeric', { precision: 12, scale: 4, default: 0 }),
    __metadata("design:type", Number)
], CreditNoteDetailOrmEntity.prototype, "unit_price", void 0);
__decorate([
    (0, typeorm_1.Column)('numeric', { precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], CreditNoteDetailOrmEntity.prototype, "discount", void 0);
__decorate([
    (0, typeorm_1.Column)('numeric', { precision: 5, scale: 2, default: 15 }),
    __metadata("design:type", Number)
], CreditNoteDetailOrmEntity.prototype, "tax_rate", void 0);
__decorate([
    (0, typeorm_1.Column)('numeric', { precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], CreditNoteDetailOrmEntity.prototype, "tax_value", void 0);
__decorate([
    (0, typeorm_1.Column)('numeric', { precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], CreditNoteDetailOrmEntity.prototype, "subtotal", void 0);
__decorate([
    (0, typeorm_1.Column)('numeric', { precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], CreditNoteDetailOrmEntity.prototype, "total", void 0);
exports.CreditNoteDetailOrmEntity = CreditNoteDetailOrmEntity = __decorate([
    (0, typeorm_1.Entity)('tab_credit_note_detail')
], CreditNoteDetailOrmEntity);
//# sourceMappingURL=credit-note.orm-entity.js.map