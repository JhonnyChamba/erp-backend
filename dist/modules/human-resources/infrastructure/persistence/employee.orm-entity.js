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
exports.EmployeeOrmEntity = void 0;
const typeorm_1 = require("typeorm");
const company_orm_entity_1 = require("../../../company/infrastructure/persistence/company.orm-entity");
const branch_company_orm_entity_1 = require("../../../branch-company/infrastructure/persistence/branch-company.orm-entity");
const employee_category_orm_entity_1 = require("./employee-category.orm-entity");
const users_orm_entity_1 = require("../../../users/infrastructure/persistence/users.orm-entity");
let EmployeeOrmEntity = class EmployeeOrmEntity {
    id;
    company_id;
    company;
    branch_id;
    branch;
    category_id;
    category;
    user_id;
    user;
    first_name;
    last_name;
    id_type;
    id_number;
    birth_date;
    gender;
    phone;
    email;
    address;
    photo_url;
    hire_date;
    contract_type;
    base_salary;
    payment_frequency;
    bank_name;
    bank_account_type;
    bank_account_number;
    iess_affiliation_code;
    accepts_appointments;
    calendar_color;
    commission_rate;
    status;
    deleted;
    created_at;
    updated_at;
};
exports.EmployeeOrmEntity = EmployeeOrmEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], EmployeeOrmEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'company_id', type: 'int' }),
    __metadata("design:type", Number)
], EmployeeOrmEntity.prototype, "company_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => company_orm_entity_1.CompanyOrmEntity, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'company_id' }),
    __metadata("design:type", company_orm_entity_1.CompanyOrmEntity)
], EmployeeOrmEntity.prototype, "company", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'branch_id', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], EmployeeOrmEntity.prototype, "branch_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => branch_company_orm_entity_1.BranchCompanyOrmEntity, { nullable: true, onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'branch_id' }),
    __metadata("design:type", branch_company_orm_entity_1.BranchCompanyOrmEntity)
], EmployeeOrmEntity.prototype, "branch", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'category_id', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], EmployeeOrmEntity.prototype, "category_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => employee_category_orm_entity_1.EmployeeCategoryOrmEntity, { nullable: true, onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'category_id' }),
    __metadata("design:type", employee_category_orm_entity_1.EmployeeCategoryOrmEntity)
], EmployeeOrmEntity.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], EmployeeOrmEntity.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => users_orm_entity_1.UsersOrmEntity, { nullable: true, onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", users_orm_entity_1.UsersOrmEntity)
], EmployeeOrmEntity.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'first_name', type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], EmployeeOrmEntity.prototype, "first_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_name', type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], EmployeeOrmEntity.prototype, "last_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'id_type', type: 'varchar', length: 10, default: '05' }),
    __metadata("design:type", String)
], EmployeeOrmEntity.prototype, "id_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'id_number', type: 'varchar', length: 30 }),
    __metadata("design:type", String)
], EmployeeOrmEntity.prototype, "id_number", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'birth_date', type: 'date', nullable: true }),
    __metadata("design:type", String)
], EmployeeOrmEntity.prototype, "birth_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'gender', type: 'varchar', length: 20, nullable: true }),
    __metadata("design:type", String)
], EmployeeOrmEntity.prototype, "gender", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'phone', type: 'varchar', length: 30, nullable: true }),
    __metadata("design:type", String)
], EmployeeOrmEntity.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'email', type: 'varchar', length: 150, nullable: true }),
    __metadata("design:type", String)
], EmployeeOrmEntity.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'address', type: 'text', nullable: true }),
    __metadata("design:type", String)
], EmployeeOrmEntity.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'photo_url', type: 'text', nullable: true }),
    __metadata("design:type", String)
], EmployeeOrmEntity.prototype, "photo_url", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'hire_date', type: 'date', default: () => 'CURRENT_DATE' }),
    __metadata("design:type", String)
], EmployeeOrmEntity.prototype, "hire_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'contract_type', type: 'varchar', length: 50, default: 'INDEFINIDO' }),
    __metadata("design:type", String)
], EmployeeOrmEntity.prototype, "contract_type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'base_salary',
        type: 'decimal',
        precision: 10,
        scale: 2,
        default: 0.00,
        transformer: {
            to: (value) => value,
            from: (value) => (value !== null ? parseFloat(value) : 0),
        },
    }),
    __metadata("design:type", Number)
], EmployeeOrmEntity.prototype, "base_salary", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'payment_frequency', type: 'varchar', length: 20, default: 'MENSUAL' }),
    __metadata("design:type", String)
], EmployeeOrmEntity.prototype, "payment_frequency", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'bank_name', type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], EmployeeOrmEntity.prototype, "bank_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'bank_account_type', type: 'varchar', length: 20, nullable: true }),
    __metadata("design:type", String)
], EmployeeOrmEntity.prototype, "bank_account_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'bank_account_number', type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], EmployeeOrmEntity.prototype, "bank_account_number", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'iess_affiliation_code', type: 'varchar', length: 30, nullable: true }),
    __metadata("design:type", String)
], EmployeeOrmEntity.prototype, "iess_affiliation_code", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'accepts_appointments', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], EmployeeOrmEntity.prototype, "accepts_appointments", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'calendar_color', type: 'varchar', length: 20, default: '#0085db' }),
    __metadata("design:type", String)
], EmployeeOrmEntity.prototype, "calendar_color", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'commission_rate',
        type: 'decimal',
        precision: 5,
        scale: 2,
        default: 0.00,
        transformer: {
            to: (value) => value,
            from: (value) => (value !== null ? parseFloat(value) : 0),
        },
    }),
    __metadata("design:type", Number)
], EmployeeOrmEntity.prototype, "commission_rate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'status', type: 'varchar', length: 20, default: 'ACTIVO' }),
    __metadata("design:type", String)
], EmployeeOrmEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'deleted', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], EmployeeOrmEntity.prototype, "deleted", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], EmployeeOrmEntity.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], EmployeeOrmEntity.prototype, "updated_at", void 0);
exports.EmployeeOrmEntity = EmployeeOrmEntity = __decorate([
    (0, typeorm_1.Entity)('tab_employees')
], EmployeeOrmEntity);
//# sourceMappingURL=employee.orm-entity.js.map