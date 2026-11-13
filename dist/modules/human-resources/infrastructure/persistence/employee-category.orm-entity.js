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
exports.EmployeeCategoryOrmEntity = void 0;
const typeorm_1 = require("typeorm");
const company_orm_entity_1 = require("../../../company/infrastructure/persistence/company.orm-entity");
let EmployeeCategoryOrmEntity = class EmployeeCategoryOrmEntity {
    id;
    company_id;
    company;
    name;
    description;
    default_commission_rate;
    active;
    deleted;
    created_at;
    updated_at;
};
exports.EmployeeCategoryOrmEntity = EmployeeCategoryOrmEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], EmployeeCategoryOrmEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'company_id', type: 'int' }),
    __metadata("design:type", Number)
], EmployeeCategoryOrmEntity.prototype, "company_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => company_orm_entity_1.CompanyOrmEntity, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'company_id' }),
    __metadata("design:type", company_orm_entity_1.CompanyOrmEntity)
], EmployeeCategoryOrmEntity.prototype, "company", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], EmployeeCategoryOrmEntity.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], EmployeeCategoryOrmEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'default_commission_rate',
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
], EmployeeCategoryOrmEntity.prototype, "default_commission_rate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], EmployeeCategoryOrmEntity.prototype, "active", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], EmployeeCategoryOrmEntity.prototype, "deleted", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], EmployeeCategoryOrmEntity.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], EmployeeCategoryOrmEntity.prototype, "updated_at", void 0);
exports.EmployeeCategoryOrmEntity = EmployeeCategoryOrmEntity = __decorate([
    (0, typeorm_1.Entity)('tab_employee_categories')
], EmployeeCategoryOrmEntity);
//# sourceMappingURL=employee-category.orm-entity.js.map