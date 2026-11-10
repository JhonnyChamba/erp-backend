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
exports.SellerOrmEntity = exports.ProviderOrmEntity = exports.CustomerOrmEntity = exports.ContactBaseOrmEntity = void 0;
const typeorm_1 = require("typeorm");
const company_orm_entity_1 = require("../../../company/infrastructure/persistence/company.orm-entity");
class ContactBaseOrmEntity {
    id;
    company_id;
    company;
    tipo_documento;
    num_document;
    email;
    telefono;
    direccion;
    estado;
    deleted;
    created_by;
    created_at;
    updated_at;
}
exports.ContactBaseOrmEntity = ContactBaseOrmEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ContactBaseOrmEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'company_id' }),
    __metadata("design:type", Number)
], ContactBaseOrmEntity.prototype, "company_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => company_orm_entity_1.CompanyOrmEntity, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: 'company_id' }),
    __metadata("design:type", company_orm_entity_1.CompanyOrmEntity)
], ContactBaseOrmEntity.prototype, "company", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 2 }),
    __metadata("design:type", String)
], ContactBaseOrmEntity.prototype, "tipo_documento", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20 }),
    __metadata("design:type", String)
], ContactBaseOrmEntity.prototype, "num_document", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 150, default: '' }),
    __metadata("design:type", String)
], ContactBaseOrmEntity.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 30, default: '' }),
    __metadata("design:type", String)
], ContactBaseOrmEntity.prototype, "telefono", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 250, default: '' }),
    __metadata("design:type", String)
], ContactBaseOrmEntity.prototype, "direccion", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 10, default: 'activo' }),
    __metadata("design:type", String)
], ContactBaseOrmEntity.prototype, "estado", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], ContactBaseOrmEntity.prototype, "deleted", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], ContactBaseOrmEntity.prototype, "created_by", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], ContactBaseOrmEntity.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], ContactBaseOrmEntity.prototype, "updated_at", void 0);
let CustomerOrmEntity = class CustomerOrmEntity extends ContactBaseOrmEntity {
    razon_social;
    nombre_comercial;
    ciudad;
};
exports.CustomerOrmEntity = CustomerOrmEntity;
__decorate([
    (0, typeorm_1.Column)({ length: 200 }),
    __metadata("design:type", String)
], CustomerOrmEntity.prototype, "razon_social", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 200, nullable: true }),
    __metadata("design:type", String)
], CustomerOrmEntity.prototype, "nombre_comercial", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], CustomerOrmEntity.prototype, "ciudad", void 0);
exports.CustomerOrmEntity = CustomerOrmEntity = __decorate([
    (0, typeorm_1.Index)(['company_id', 'num_document'], { unique: true, where: '"deleted" = false' }),
    (0, typeorm_1.Entity)('tab_customer')
], CustomerOrmEntity);
let ProviderOrmEntity = class ProviderOrmEntity extends ContactBaseOrmEntity {
    razon_social;
    nombre_comercial;
    forma_pago;
    banco;
    num_cuenta;
};
exports.ProviderOrmEntity = ProviderOrmEntity;
__decorate([
    (0, typeorm_1.Column)({ length: 200 }),
    __metadata("design:type", String)
], ProviderOrmEntity.prototype, "razon_social", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 200, nullable: true }),
    __metadata("design:type", String)
], ProviderOrmEntity.prototype, "nombre_comercial", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, default: 'contado' }),
    __metadata("design:type", String)
], ProviderOrmEntity.prototype, "forma_pago", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], ProviderOrmEntity.prototype, "banco", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 40, nullable: true }),
    __metadata("design:type", String)
], ProviderOrmEntity.prototype, "num_cuenta", void 0);
exports.ProviderOrmEntity = ProviderOrmEntity = __decorate([
    (0, typeorm_1.Index)(['company_id', 'num_document'], { unique: true, where: '"deleted" = false' }),
    (0, typeorm_1.Entity)('tab_provider')
], ProviderOrmEntity);
let SellerOrmEntity = class SellerOrmEntity extends ContactBaseOrmEntity {
    nombres;
    apellidos;
    comision_pct;
};
exports.SellerOrmEntity = SellerOrmEntity;
__decorate([
    (0, typeorm_1.Column)({ length: 120 }),
    __metadata("design:type", String)
], SellerOrmEntity.prototype, "nombres", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 120 }),
    __metadata("design:type", String)
], SellerOrmEntity.prototype, "apellidos", void 0);
__decorate([
    (0, typeorm_1.Column)('numeric', { precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], SellerOrmEntity.prototype, "comision_pct", void 0);
exports.SellerOrmEntity = SellerOrmEntity = __decorate([
    (0, typeorm_1.Index)(['company_id', 'num_document'], { unique: true, where: '"deleted" = false' }),
    (0, typeorm_1.Entity)('tab_seller')
], SellerOrmEntity);
//# sourceMappingURL=contacts.orm-entity.js.map