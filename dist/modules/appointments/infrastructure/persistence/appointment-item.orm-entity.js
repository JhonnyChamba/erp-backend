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
exports.AppointmentItemOrmEntity = void 0;
const typeorm_1 = require("typeorm");
const appointment_orm_entity_1 = require("./appointment.orm-entity");
const inventory_orm_entity_1 = require("../../../inventory/infrastructure/persistence/inventory.orm-entity");
let AppointmentItemOrmEntity = class AppointmentItemOrmEntity {
    id;
    appointment_id;
    appointment;
    service_id;
    service;
    service_name;
    duration_minutes;
    price;
    tax_rate;
    tax_amount;
    total;
    notes;
};
exports.AppointmentItemOrmEntity = AppointmentItemOrmEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], AppointmentItemOrmEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'appointment_id', type: 'int' }),
    __metadata("design:type", Number)
], AppointmentItemOrmEntity.prototype, "appointment_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => appointment_orm_entity_1.AppointmentOrmEntity, (apt) => apt.items, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'appointment_id' }),
    __metadata("design:type", appointment_orm_entity_1.AppointmentOrmEntity)
], AppointmentItemOrmEntity.prototype, "appointment", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'service_id', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], AppointmentItemOrmEntity.prototype, "service_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => inventory_orm_entity_1.InventoryServiceOrmEntity, { nullable: true, onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'service_id' }),
    __metadata("design:type", inventory_orm_entity_1.InventoryServiceOrmEntity)
], AppointmentItemOrmEntity.prototype, "service", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'service_name', type: 'varchar', length: 200 }),
    __metadata("design:type", String)
], AppointmentItemOrmEntity.prototype, "service_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'duration_minutes', type: 'int', default: 30 }),
    __metadata("design:type", Number)
], AppointmentItemOrmEntity.prototype, "duration_minutes", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'price',
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
], AppointmentItemOrmEntity.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'tax_rate',
        type: 'decimal',
        precision: 5,
        scale: 2,
        default: 15.0,
        transformer: {
            to: (value) => value,
            from: (value) => (value !== null ? parseFloat(value) : 15.0),
        },
    }),
    __metadata("design:type", Number)
], AppointmentItemOrmEntity.prototype, "tax_rate", void 0);
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
], AppointmentItemOrmEntity.prototype, "tax_amount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'total',
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
], AppointmentItemOrmEntity.prototype, "total", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'notes', type: 'text', nullable: true }),
    __metadata("design:type", String)
], AppointmentItemOrmEntity.prototype, "notes", void 0);
exports.AppointmentItemOrmEntity = AppointmentItemOrmEntity = __decorate([
    (0, typeorm_1.Entity)('tab_appointment_items')
], AppointmentItemOrmEntity);
//# sourceMappingURL=appointment-item.orm-entity.js.map