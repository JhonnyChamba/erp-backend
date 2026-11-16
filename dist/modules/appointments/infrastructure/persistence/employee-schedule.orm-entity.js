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
exports.EmployeeScheduleOrmEntity = void 0;
const typeorm_1 = require("typeorm");
const company_orm_entity_1 = require("../../../company/infrastructure/persistence/company.orm-entity");
const employee_orm_entity_1 = require("../../../human-resources/infrastructure/persistence/employee.orm-entity");
let EmployeeScheduleOrmEntity = class EmployeeScheduleOrmEntity {
    id;
    company_id;
    company;
    employee_id;
    employee;
    day_of_week;
    start_time;
    end_time;
    break_start;
    break_end;
    active;
    created_at;
    updated_at;
};
exports.EmployeeScheduleOrmEntity = EmployeeScheduleOrmEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], EmployeeScheduleOrmEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'company_id', type: 'int' }),
    __metadata("design:type", Number)
], EmployeeScheduleOrmEntity.prototype, "company_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => company_orm_entity_1.CompanyOrmEntity, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'company_id' }),
    __metadata("design:type", company_orm_entity_1.CompanyOrmEntity)
], EmployeeScheduleOrmEntity.prototype, "company", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'employee_id', type: 'int' }),
    __metadata("design:type", Number)
], EmployeeScheduleOrmEntity.prototype, "employee_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => employee_orm_entity_1.EmployeeOrmEntity, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'employee_id' }),
    __metadata("design:type", employee_orm_entity_1.EmployeeOrmEntity)
], EmployeeScheduleOrmEntity.prototype, "employee", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'day_of_week', type: 'int' }),
    __metadata("design:type", Number)
], EmployeeScheduleOrmEntity.prototype, "day_of_week", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'start_time', type: 'time', default: '09:00:00' }),
    __metadata("design:type", String)
], EmployeeScheduleOrmEntity.prototype, "start_time", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'end_time', type: 'time', default: '19:00:00' }),
    __metadata("design:type", String)
], EmployeeScheduleOrmEntity.prototype, "end_time", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'break_start', type: 'time', nullable: true, default: '13:00:00' }),
    __metadata("design:type", String)
], EmployeeScheduleOrmEntity.prototype, "break_start", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'break_end', type: 'time', nullable: true, default: '14:00:00' }),
    __metadata("design:type", String)
], EmployeeScheduleOrmEntity.prototype, "break_end", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'active', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], EmployeeScheduleOrmEntity.prototype, "active", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], EmployeeScheduleOrmEntity.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], EmployeeScheduleOrmEntity.prototype, "updated_at", void 0);
exports.EmployeeScheduleOrmEntity = EmployeeScheduleOrmEntity = __decorate([
    (0, typeorm_1.Entity)('tab_employee_schedules')
], EmployeeScheduleOrmEntity);
//# sourceMappingURL=employee-schedule.orm-entity.js.map