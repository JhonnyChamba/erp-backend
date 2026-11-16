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
exports.AppointmentOrmEntity = void 0;
const typeorm_1 = require("typeorm");
const company_orm_entity_1 = require("../../../company/infrastructure/persistence/company.orm-entity");
const branch_company_orm_entity_1 = require("../../../branch-company/infrastructure/persistence/branch-company.orm-entity");
const contacts_orm_entity_1 = require("../../../contacts/infrastructure/persistence/contacts.orm-entity");
const employee_orm_entity_1 = require("../../../human-resources/infrastructure/persistence/employee.orm-entity");
const appointment_item_orm_entity_1 = require("./appointment-item.orm-entity");
let AppointmentOrmEntity = class AppointmentOrmEntity {
    id;
    company_id;
    company;
    branch_id;
    branch;
    customer_id;
    customer;
    employee_id;
    employee;
    order_number;
    appointment_date;
    start_time;
    end_time;
    status;
    subtotal;
    tax_amount;
    total_estimated;
    notes;
    invoice_id;
    deleted;
    items;
    created_at;
    updated_at;
};
exports.AppointmentOrmEntity = AppointmentOrmEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], AppointmentOrmEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'company_id', type: 'int' }),
    __metadata("design:type", Number)
], AppointmentOrmEntity.prototype, "company_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => company_orm_entity_1.CompanyOrmEntity, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'company_id' }),
    __metadata("design:type", company_orm_entity_1.CompanyOrmEntity)
], AppointmentOrmEntity.prototype, "company", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'branch_id', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], AppointmentOrmEntity.prototype, "branch_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => branch_company_orm_entity_1.BranchCompanyOrmEntity, { nullable: true, onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'branch_id' }),
    __metadata("design:type", branch_company_orm_entity_1.BranchCompanyOrmEntity)
], AppointmentOrmEntity.prototype, "branch", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'customer_id', type: 'int' }),
    __metadata("design:type", Number)
], AppointmentOrmEntity.prototype, "customer_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => contacts_orm_entity_1.CustomerOrmEntity, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'customer_id' }),
    __metadata("design:type", contacts_orm_entity_1.CustomerOrmEntity)
], AppointmentOrmEntity.prototype, "customer", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'employee_id', type: 'int' }),
    __metadata("design:type", Number)
], AppointmentOrmEntity.prototype, "employee_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => employee_orm_entity_1.EmployeeOrmEntity, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'employee_id' }),
    __metadata("design:type", employee_orm_entity_1.EmployeeOrmEntity)
], AppointmentOrmEntity.prototype, "employee", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'order_number', type: 'varchar', length: 30, unique: true }),
    __metadata("design:type", String)
], AppointmentOrmEntity.prototype, "order_number", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'appointment_date', type: 'date' }),
    __metadata("design:type", String)
], AppointmentOrmEntity.prototype, "appointment_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'start_time', type: 'time' }),
    __metadata("design:type", String)
], AppointmentOrmEntity.prototype, "start_time", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'end_time', type: 'time' }),
    __metadata("design:type", String)
], AppointmentOrmEntity.prototype, "end_time", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'status', type: 'varchar', length: 20, default: 'PROGRAMADA' }),
    __metadata("design:type", String)
], AppointmentOrmEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'subtotal',
        type: 'decimal',
        precision: 10,
        scale: 2,
        default: 0.0,
        transformer: {
            to: (value) => value,
            from: (value) => (value !== null ? parseFloat(value) : 0),
        },
    }),
    __metadata("design:type", Number)
], AppointmentOrmEntity.prototype, "subtotal", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'tax_amount',
        type: 'decimal',
        precision: 10,
        scale: 2,
        default: 0.0,
        transformer: {
            to: (value) => value,
            from: (value) => (value !== null ? parseFloat(value) : 0),
        },
    }),
    __metadata("design:type", Number)
], AppointmentOrmEntity.prototype, "tax_amount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'total_estimated',
        type: 'decimal',
        precision: 10,
        scale: 2,
        default: 0.0,
        transformer: {
            to: (value) => value,
            from: (value) => (value !== null ? parseFloat(value) : 0),
        },
    }),
    __metadata("design:type", Number)
], AppointmentOrmEntity.prototype, "total_estimated", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'notes', type: 'text', nullable: true }),
    __metadata("design:type", String)
], AppointmentOrmEntity.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'invoice_id', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], AppointmentOrmEntity.prototype, "invoice_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'deleted', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], AppointmentOrmEntity.prototype, "deleted", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => appointment_item_orm_entity_1.AppointmentItemOrmEntity, (item) => item.appointment, { cascade: true }),
    __metadata("design:type", Array)
], AppointmentOrmEntity.prototype, "items", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], AppointmentOrmEntity.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], AppointmentOrmEntity.prototype, "updated_at", void 0);
exports.AppointmentOrmEntity = AppointmentOrmEntity = __decorate([
    (0, typeorm_1.Entity)('tab_appointments')
], AppointmentOrmEntity);
//# sourceMappingURL=appointment.orm-entity.js.map