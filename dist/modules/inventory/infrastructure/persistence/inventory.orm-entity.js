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
exports.InventoryWarehouseOrmEntity = exports.InventoryCategoryOrmEntity = exports.InventorySubcontractOrmEntity = exports.InventoryServiceOrmEntity = exports.InventoryItemOrmEntity = void 0;
const typeorm_1 = require("typeorm");
const company_orm_entity_1 = require("../../../company/infrastructure/persistence/company.orm-entity");
let InventoryItemOrmEntity = class InventoryItemOrmEntity {
    id;
    code;
    sku;
    name;
    category_id;
    category;
    unit_measure;
    cost_price;
    sale_price;
    tax_rate;
    stock_current;
    stock_min;
    warehouse_id;
    warehouse_location;
    description;
    company;
    created_by;
    enabled;
    deleted;
    created_at;
};
exports.InventoryItemOrmEntity = InventoryItemOrmEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], InventoryItemOrmEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 25 }),
    __metadata("design:type", String)
], InventoryItemOrmEntity.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 60, nullable: true }),
    __metadata("design:type", String)
], InventoryItemOrmEntity.prototype, "sku", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 180 }),
    __metadata("design:type", String)
], InventoryItemOrmEntity.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], InventoryItemOrmEntity.prototype, "category_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, default: 'General' }),
    __metadata("design:type", String)
], InventoryItemOrmEntity.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, default: 'Unidad' }),
    __metadata("design:type", String)
], InventoryItemOrmEntity.prototype, "unit_measure", void 0);
__decorate([
    (0, typeorm_1.Column)('numeric', { precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], InventoryItemOrmEntity.prototype, "cost_price", void 0);
__decorate([
    (0, typeorm_1.Column)('numeric', { precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], InventoryItemOrmEntity.prototype, "sale_price", void 0);
__decorate([
    (0, typeorm_1.Column)('numeric', { precision: 5, scale: 2, default: 15 }),
    __metadata("design:type", Number)
], InventoryItemOrmEntity.prototype, "tax_rate", void 0);
__decorate([
    (0, typeorm_1.Column)('numeric', { precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], InventoryItemOrmEntity.prototype, "stock_current", void 0);
__decorate([
    (0, typeorm_1.Column)('numeric', { precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], InventoryItemOrmEntity.prototype, "stock_min", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], InventoryItemOrmEntity.prototype, "warehouse_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 120, nullable: true }),
    __metadata("design:type", String)
], InventoryItemOrmEntity.prototype, "warehouse_location", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], InventoryItemOrmEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => company_orm_entity_1.CompanyOrmEntity, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'company_id' }),
    __metadata("design:type", company_orm_entity_1.CompanyOrmEntity)
], InventoryItemOrmEntity.prototype, "company", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], InventoryItemOrmEntity.prototype, "created_by", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], InventoryItemOrmEntity.prototype, "enabled", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], InventoryItemOrmEntity.prototype, "deleted", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], InventoryItemOrmEntity.prototype, "created_at", void 0);
exports.InventoryItemOrmEntity = InventoryItemOrmEntity = __decorate([
    (0, typeorm_1.Entity)('tab_inventory_item')
], InventoryItemOrmEntity);
let InventoryServiceOrmEntity = class InventoryServiceOrmEntity {
    id;
    code;
    name;
    category;
    billing_unit;
    base_cost;
    sale_price;
    tax_rate;
    estimated_duration;
    description;
    company;
    created_by;
    enabled;
    deleted;
    created_at;
};
exports.InventoryServiceOrmEntity = InventoryServiceOrmEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], InventoryServiceOrmEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 25 }),
    __metadata("design:type", String)
], InventoryServiceOrmEntity.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 180 }),
    __metadata("design:type", String)
], InventoryServiceOrmEntity.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, default: 'Servicios Generales' }),
    __metadata("design:type", String)
], InventoryServiceOrmEntity.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, default: 'Servicio' }),
    __metadata("design:type", String)
], InventoryServiceOrmEntity.prototype, "billing_unit", void 0);
__decorate([
    (0, typeorm_1.Column)('numeric', { precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], InventoryServiceOrmEntity.prototype, "base_cost", void 0);
__decorate([
    (0, typeorm_1.Column)('numeric', { precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], InventoryServiceOrmEntity.prototype, "sale_price", void 0);
__decorate([
    (0, typeorm_1.Column)('numeric', { precision: 5, scale: 2, default: 15 }),
    __metadata("design:type", Number)
], InventoryServiceOrmEntity.prototype, "tax_rate", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 80, nullable: true }),
    __metadata("design:type", String)
], InventoryServiceOrmEntity.prototype, "estimated_duration", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], InventoryServiceOrmEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => company_orm_entity_1.CompanyOrmEntity, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'company_id' }),
    __metadata("design:type", company_orm_entity_1.CompanyOrmEntity)
], InventoryServiceOrmEntity.prototype, "company", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], InventoryServiceOrmEntity.prototype, "created_by", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], InventoryServiceOrmEntity.prototype, "enabled", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], InventoryServiceOrmEntity.prototype, "deleted", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], InventoryServiceOrmEntity.prototype, "created_at", void 0);
exports.InventoryServiceOrmEntity = InventoryServiceOrmEntity = __decorate([
    (0, typeorm_1.Entity)('tab_inventory_service')
], InventoryServiceOrmEntity);
let InventorySubcontractOrmEntity = class InventorySubcontractOrmEntity {
    id;
    code;
    name;
    specialty_area;
    contractor_name;
    contractor_ruc;
    unit_measure;
    unit_cost;
    suggested_price;
    tax_rate;
    includes_materials;
    description;
    company;
    created_by;
    enabled;
    deleted;
    created_at;
};
exports.InventorySubcontractOrmEntity = InventorySubcontractOrmEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], InventorySubcontractOrmEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 25 }),
    __metadata("design:type", String)
], InventorySubcontractOrmEntity.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 180 }),
    __metadata("design:type", String)
], InventorySubcontractOrmEntity.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, default: 'Mano de Obra' }),
    __metadata("design:type", String)
], InventorySubcontractOrmEntity.prototype, "specialty_area", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 160, nullable: true }),
    __metadata("design:type", String)
], InventorySubcontractOrmEntity.prototype, "contractor_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 25, nullable: true }),
    __metadata("design:type", String)
], InventorySubcontractOrmEntity.prototype, "contractor_ruc", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, default: 'Hora Hombre' }),
    __metadata("design:type", String)
], InventorySubcontractOrmEntity.prototype, "unit_measure", void 0);
__decorate([
    (0, typeorm_1.Column)('numeric', { precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], InventorySubcontractOrmEntity.prototype, "unit_cost", void 0);
__decorate([
    (0, typeorm_1.Column)('numeric', { precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], InventorySubcontractOrmEntity.prototype, "suggested_price", void 0);
__decorate([
    (0, typeorm_1.Column)('numeric', { precision: 5, scale: 2, default: 15 }),
    __metadata("design:type", Number)
], InventorySubcontractOrmEntity.prototype, "tax_rate", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], InventorySubcontractOrmEntity.prototype, "includes_materials", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], InventorySubcontractOrmEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => company_orm_entity_1.CompanyOrmEntity, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'company_id' }),
    __metadata("design:type", company_orm_entity_1.CompanyOrmEntity)
], InventorySubcontractOrmEntity.prototype, "company", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], InventorySubcontractOrmEntity.prototype, "created_by", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], InventorySubcontractOrmEntity.prototype, "enabled", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], InventorySubcontractOrmEntity.prototype, "deleted", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], InventorySubcontractOrmEntity.prototype, "created_at", void 0);
exports.InventorySubcontractOrmEntity = InventorySubcontractOrmEntity = __decorate([
    (0, typeorm_1.Entity)('tab_inventory_subcontract')
], InventorySubcontractOrmEntity);
let InventoryCategoryOrmEntity = class InventoryCategoryOrmEntity {
    id;
    code;
    name;
    description;
    company;
    created_by;
    enabled;
    deleted;
    created_at;
};
exports.InventoryCategoryOrmEntity = InventoryCategoryOrmEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], InventoryCategoryOrmEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 25 }),
    __metadata("design:type", String)
], InventoryCategoryOrmEntity.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 120 }),
    __metadata("design:type", String)
], InventoryCategoryOrmEntity.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], InventoryCategoryOrmEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => company_orm_entity_1.CompanyOrmEntity, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'company_id' }),
    __metadata("design:type", company_orm_entity_1.CompanyOrmEntity)
], InventoryCategoryOrmEntity.prototype, "company", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], InventoryCategoryOrmEntity.prototype, "created_by", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], InventoryCategoryOrmEntity.prototype, "enabled", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], InventoryCategoryOrmEntity.prototype, "deleted", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], InventoryCategoryOrmEntity.prototype, "created_at", void 0);
exports.InventoryCategoryOrmEntity = InventoryCategoryOrmEntity = __decorate([
    (0, typeorm_1.Entity)('tab_inventory_category')
], InventoryCategoryOrmEntity);
let InventoryWarehouseOrmEntity = class InventoryWarehouseOrmEntity {
    id;
    code;
    name;
    address;
    responsible;
    phone;
    branch_id;
    is_default;
    company;
    created_by;
    enabled;
    deleted;
    created_at;
};
exports.InventoryWarehouseOrmEntity = InventoryWarehouseOrmEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], InventoryWarehouseOrmEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 25 }),
    __metadata("design:type", String)
], InventoryWarehouseOrmEntity.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 120 }),
    __metadata("design:type", String)
], InventoryWarehouseOrmEntity.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, nullable: true }),
    __metadata("design:type", String)
], InventoryWarehouseOrmEntity.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 120, nullable: true }),
    __metadata("design:type", String)
], InventoryWarehouseOrmEntity.prototype, "responsible", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 40, nullable: true }),
    __metadata("design:type", String)
], InventoryWarehouseOrmEntity.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], InventoryWarehouseOrmEntity.prototype, "branch_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], InventoryWarehouseOrmEntity.prototype, "is_default", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => company_orm_entity_1.CompanyOrmEntity, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'company_id' }),
    __metadata("design:type", company_orm_entity_1.CompanyOrmEntity)
], InventoryWarehouseOrmEntity.prototype, "company", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], InventoryWarehouseOrmEntity.prototype, "created_by", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], InventoryWarehouseOrmEntity.prototype, "enabled", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], InventoryWarehouseOrmEntity.prototype, "deleted", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], InventoryWarehouseOrmEntity.prototype, "created_at", void 0);
exports.InventoryWarehouseOrmEntity = InventoryWarehouseOrmEntity = __decorate([
    (0, typeorm_1.Entity)('tab_inventory_warehouse')
], InventoryWarehouseOrmEntity);
//# sourceMappingURL=inventory.orm-entity.js.map