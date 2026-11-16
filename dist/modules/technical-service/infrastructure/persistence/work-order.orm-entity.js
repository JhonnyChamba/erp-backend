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
exports.WorkOrderOrmEntity = void 0;
const typeorm_1 = require("typeorm");
const company_orm_entity_1 = require("../../../company/infrastructure/persistence/company.orm-entity");
const branch_company_orm_entity_1 = require("../../../branch-company/infrastructure/persistence/branch-company.orm-entity");
const contacts_orm_entity_1 = require("../../../contacts/infrastructure/persistence/contacts.orm-entity");
const work_order_item_orm_entity_1 = require("./work-order-item.orm-entity");
let WorkOrderOrmEntity = class WorkOrderOrmEntity {
    id;
    company_id;
    company;
    branch_id;
    branch;
    customer_id;
    customer;
    customer_name;
    customer_phone;
    customer_email;
    technician_id;
    technician_name;
    order_number;
    service_type;
    priority;
    status;
    equipment_type;
    brand;
    model;
    serial_number;
    color;
    security_pin;
    accessories;
    physical_condition;
    reported_failure;
    technical_diagnosis;
    solution_applied;
    entry_date;
    estimated_delivery_date;
    real_delivery_date;
    warranty_days;
    labor_cost;
    parts_cost;
    subtotal;
    tax_amount;
    total_amount;
    advance_payment;
    pending_balance;
    notes;
    deleted;
    created_at;
    updated_at;
    items;
};
exports.WorkOrderOrmEntity = WorkOrderOrmEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], WorkOrderOrmEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'company_id', type: 'int' }),
    __metadata("design:type", Number)
], WorkOrderOrmEntity.prototype, "company_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => company_orm_entity_1.CompanyOrmEntity, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'company_id' }),
    __metadata("design:type", company_orm_entity_1.CompanyOrmEntity)
], WorkOrderOrmEntity.prototype, "company", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'branch_id', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], WorkOrderOrmEntity.prototype, "branch_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => branch_company_orm_entity_1.BranchCompanyOrmEntity, { nullable: true, onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'branch_id' }),
    __metadata("design:type", branch_company_orm_entity_1.BranchCompanyOrmEntity)
], WorkOrderOrmEntity.prototype, "branch", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'customer_id', type: 'int' }),
    __metadata("design:type", Number)
], WorkOrderOrmEntity.prototype, "customer_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => contacts_orm_entity_1.CustomerOrmEntity, { onDelete: 'RESTRICT' }),
    (0, typeorm_1.JoinColumn)({ name: 'customer_id' }),
    __metadata("design:type", contacts_orm_entity_1.CustomerOrmEntity)
], WorkOrderOrmEntity.prototype, "customer", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'customer_name', type: 'varchar', length: 150, nullable: true }),
    __metadata("design:type", String)
], WorkOrderOrmEntity.prototype, "customer_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'customer_phone', type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], WorkOrderOrmEntity.prototype, "customer_phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'customer_email', type: 'varchar', length: 150, nullable: true }),
    __metadata("design:type", String)
], WorkOrderOrmEntity.prototype, "customer_email", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'technician_id', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], WorkOrderOrmEntity.prototype, "technician_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'technician_name', type: 'varchar', length: 150, nullable: true }),
    __metadata("design:type", String)
], WorkOrderOrmEntity.prototype, "technician_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'order_number', type: 'varchar', length: 30 }),
    __metadata("design:type", String)
], WorkOrderOrmEntity.prototype, "order_number", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'service_type', type: 'varchar', length: 50, default: 'REPARACION' }),
    __metadata("design:type", String)
], WorkOrderOrmEntity.prototype, "service_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'priority', type: 'varchar', length: 20, default: 'MEDIA' }),
    __metadata("design:type", String)
], WorkOrderOrmEntity.prototype, "priority", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'status', type: 'varchar', length: 30, default: 'RECIBIDO' }),
    __metadata("design:type", String)
], WorkOrderOrmEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'equipment_type', type: 'varchar', length: 50, default: 'Laptop' }),
    __metadata("design:type", String)
], WorkOrderOrmEntity.prototype, "equipment_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'brand', type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], WorkOrderOrmEntity.prototype, "brand", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'model', type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], WorkOrderOrmEntity.prototype, "model", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'serial_number', type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], WorkOrderOrmEntity.prototype, "serial_number", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'color', type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], WorkOrderOrmEntity.prototype, "color", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'security_pin', type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], WorkOrderOrmEntity.prototype, "security_pin", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'accessories', type: 'text', nullable: true }),
    __metadata("design:type", String)
], WorkOrderOrmEntity.prototype, "accessories", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'physical_condition', type: 'text', nullable: true }),
    __metadata("design:type", String)
], WorkOrderOrmEntity.prototype, "physical_condition", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reported_failure', type: 'text' }),
    __metadata("design:type", String)
], WorkOrderOrmEntity.prototype, "reported_failure", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'technical_diagnosis', type: 'text', nullable: true }),
    __metadata("design:type", String)
], WorkOrderOrmEntity.prototype, "technical_diagnosis", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'solution_applied', type: 'text', nullable: true }),
    __metadata("design:type", String)
], WorkOrderOrmEntity.prototype, "solution_applied", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'entry_date', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], WorkOrderOrmEntity.prototype, "entry_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'estimated_delivery_date', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], WorkOrderOrmEntity.prototype, "estimated_delivery_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'real_delivery_date', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], WorkOrderOrmEntity.prototype, "real_delivery_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'warranty_days', type: 'int', default: 30 }),
    __metadata("design:type", Number)
], WorkOrderOrmEntity.prototype, "warranty_days", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'labor_cost',
        type: 'decimal',
        precision: 10,
        scale: 2,
        default: 0.0,
        transformer: {
            to: (v) => v,
            from: (v) => (v !== null ? parseFloat(v) : 0.0),
        },
    }),
    __metadata("design:type", Number)
], WorkOrderOrmEntity.prototype, "labor_cost", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'parts_cost',
        type: 'decimal',
        precision: 10,
        scale: 2,
        default: 0.0,
        transformer: {
            to: (v) => v,
            from: (v) => (v !== null ? parseFloat(v) : 0.0),
        },
    }),
    __metadata("design:type", Number)
], WorkOrderOrmEntity.prototype, "parts_cost", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'subtotal',
        type: 'decimal',
        precision: 10,
        scale: 2,
        default: 0.0,
        transformer: {
            to: (v) => v,
            from: (v) => (v !== null ? parseFloat(v) : 0.0),
        },
    }),
    __metadata("design:type", Number)
], WorkOrderOrmEntity.prototype, "subtotal", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'tax_amount',
        type: 'decimal',
        precision: 10,
        scale: 2,
        default: 0.0,
        transformer: {
            to: (v) => v,
            from: (v) => (v !== null ? parseFloat(v) : 0.0),
        },
    }),
    __metadata("design:type", Number)
], WorkOrderOrmEntity.prototype, "tax_amount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'total_amount',
        type: 'decimal',
        precision: 10,
        scale: 2,
        default: 0.0,
        transformer: {
            to: (v) => v,
            from: (v) => (v !== null ? parseFloat(v) : 0.0),
        },
    }),
    __metadata("design:type", Number)
], WorkOrderOrmEntity.prototype, "total_amount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'advance_payment',
        type: 'decimal',
        precision: 10,
        scale: 2,
        default: 0.0,
        transformer: {
            to: (v) => v,
            from: (v) => (v !== null ? parseFloat(v) : 0.0),
        },
    }),
    __metadata("design:type", Number)
], WorkOrderOrmEntity.prototype, "advance_payment", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'pending_balance',
        type: 'decimal',
        precision: 10,
        scale: 2,
        default: 0.0,
        transformer: {
            to: (v) => v,
            from: (v) => (v !== null ? parseFloat(v) : 0.0),
        },
    }),
    __metadata("design:type", Number)
], WorkOrderOrmEntity.prototype, "pending_balance", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'notes', type: 'text', nullable: true }),
    __metadata("design:type", String)
], WorkOrderOrmEntity.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], WorkOrderOrmEntity.prototype, "deleted", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], WorkOrderOrmEntity.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], WorkOrderOrmEntity.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => work_order_item_orm_entity_1.WorkOrderItemOrmEntity, (item) => item.work_order, { cascade: true }),
    __metadata("design:type", Array)
], WorkOrderOrmEntity.prototype, "items", void 0);
exports.WorkOrderOrmEntity = WorkOrderOrmEntity = __decorate([
    (0, typeorm_1.Entity)('tab_work_orders')
], WorkOrderOrmEntity);
//# sourceMappingURL=work-order.orm-entity.js.map