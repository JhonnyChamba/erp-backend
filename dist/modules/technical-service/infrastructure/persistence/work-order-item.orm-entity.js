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
exports.WorkOrderItemOrmEntity = void 0;
const typeorm_1 = require("typeorm");
const work_order_orm_entity_1 = require("./work-order.orm-entity");
let WorkOrderItemOrmEntity = class WorkOrderItemOrmEntity {
    id;
    work_order_id;
    work_order;
    item_type;
    description;
    quantity;
    unit_price;
    subtotal;
};
exports.WorkOrderItemOrmEntity = WorkOrderItemOrmEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], WorkOrderItemOrmEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'work_order_id', type: 'int' }),
    __metadata("design:type", Number)
], WorkOrderItemOrmEntity.prototype, "work_order_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => work_order_orm_entity_1.WorkOrderOrmEntity, (wo) => wo.items, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'work_order_id' }),
    __metadata("design:type", work_order_orm_entity_1.WorkOrderOrmEntity)
], WorkOrderItemOrmEntity.prototype, "work_order", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'item_type', type: 'varchar', length: 20, default: 'SERVICIO' }),
    __metadata("design:type", String)
], WorkOrderItemOrmEntity.prototype, "item_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], WorkOrderItemOrmEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        precision: 10,
        scale: 2,
        default: 1.0,
        transformer: {
            to: (v) => v,
            from: (v) => (v !== null ? parseFloat(v) : 1.0),
        },
    }),
    __metadata("design:type", Number)
], WorkOrderItemOrmEntity.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'unit_price',
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
], WorkOrderItemOrmEntity.prototype, "unit_price", void 0);
__decorate([
    (0, typeorm_1.Column)({
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
], WorkOrderItemOrmEntity.prototype, "subtotal", void 0);
exports.WorkOrderItemOrmEntity = WorkOrderItemOrmEntity = __decorate([
    (0, typeorm_1.Entity)('tab_work_order_items')
], WorkOrderItemOrmEntity);
//# sourceMappingURL=work-order-item.orm-entity.js.map