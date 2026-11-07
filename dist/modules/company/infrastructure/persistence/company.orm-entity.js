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
exports.CompanyOrmEntity = void 0;
const users_orm_entity_1 = require("../../../users/infrastructure/persistence/users.orm-entity");
const typeorm_1 = require("typeorm");
let CompanyOrmEntity = class CompanyOrmEntity {
    id;
    ruc;
    description;
    business_name;
    trade_name;
    enabled;
    deleted;
    address_matriz;
    phone;
    email;
    obligated_accounting;
    special_taxpayer;
    tax_regime;
    sri_environment;
    default_establishment;
    default_emission_point;
    cert_p12_base64;
    cert_password_enc;
    cert_file_name;
    cert_expires_at;
    smtp_host;
    smtp_port;
    smtp_secure;
    smtp_user;
    smtp_has_password;
    smtp_password_enc;
    smtp_from_name;
    smtp_from_email;
    createdBy;
    created_name;
    createdAt;
    updatedBy;
    update_name;
    updatedAt;
    deletedBy;
    deleted_name;
    deletedAt;
};
exports.CompanyOrmEntity = CompanyOrmEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], CompanyOrmEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CompanyOrmEntity.prototype, "ruc", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CompanyOrmEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CompanyOrmEntity.prototype, "business_name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CompanyOrmEntity.prototype, "trade_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], CompanyOrmEntity.prototype, "enabled", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], CompanyOrmEntity.prototype, "deleted", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 250, nullable: true }),
    __metadata("design:type", String)
], CompanyOrmEntity.prototype, "address_matriz", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 30, nullable: true }),
    __metadata("design:type", String)
], CompanyOrmEntity.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 150, nullable: true }),
    __metadata("design:type", String)
], CompanyOrmEntity.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], CompanyOrmEntity.prototype, "obligated_accounting", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, nullable: true }),
    __metadata("design:type", String)
], CompanyOrmEntity.prototype, "special_taxpayer", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 60, nullable: true }),
    __metadata("design:type", String)
], CompanyOrmEntity.prototype, "tax_regime", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 1, default: '1' }),
    __metadata("design:type", String)
], CompanyOrmEntity.prototype, "sri_environment", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 3, default: '001' }),
    __metadata("design:type", String)
], CompanyOrmEntity.prototype, "default_establishment", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 3, default: '001' }),
    __metadata("design:type", String)
], CompanyOrmEntity.prototype, "default_emission_point", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true, select: false }),
    __metadata("design:type", String)
], CompanyOrmEntity.prototype, "cert_p12_base64", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true, select: false }),
    __metadata("design:type", String)
], CompanyOrmEntity.prototype, "cert_password_enc", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 150, nullable: true }),
    __metadata("design:type", String)
], CompanyOrmEntity.prototype, "cert_file_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", String)
], CompanyOrmEntity.prototype, "cert_expires_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 150, nullable: true }),
    __metadata("design:type", String)
], CompanyOrmEntity.prototype, "smtp_host", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], CompanyOrmEntity.prototype, "smtp_port", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], CompanyOrmEntity.prototype, "smtp_secure", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 150, nullable: true }),
    __metadata("design:type", String)
], CompanyOrmEntity.prototype, "smtp_user", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], CompanyOrmEntity.prototype, "smtp_has_password", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true, select: false }),
    __metadata("design:type", String)
], CompanyOrmEntity.prototype, "smtp_password_enc", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 150, nullable: true }),
    __metadata("design:type", String)
], CompanyOrmEntity.prototype, "smtp_from_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 150, nullable: true }),
    __metadata("design:type", String)
], CompanyOrmEntity.prototype, "smtp_from_email", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => users_orm_entity_1.UsersOrmEntity, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'created_by' }),
    __metadata("design:type", users_orm_entity_1.UsersOrmEntity)
], CompanyOrmEntity.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], CompanyOrmEntity.prototype, "created_name", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], CompanyOrmEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => users_orm_entity_1.UsersOrmEntity, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'updated_by' }),
    __metadata("design:type", users_orm_entity_1.UsersOrmEntity)
], CompanyOrmEntity.prototype, "updatedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], CompanyOrmEntity.prototype, "update_name", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at', nullable: true }),
    __metadata("design:type", Date)
], CompanyOrmEntity.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => users_orm_entity_1.UsersOrmEntity, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'deleted_by' }),
    __metadata("design:type", users_orm_entity_1.UsersOrmEntity)
], CompanyOrmEntity.prototype, "deletedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], CompanyOrmEntity.prototype, "deleted_name", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)({ name: 'deleted_at' }),
    __metadata("design:type", Date)
], CompanyOrmEntity.prototype, "deletedAt", void 0);
exports.CompanyOrmEntity = CompanyOrmEntity = __decorate([
    (0, typeorm_1.Entity)('tab_company')
], CompanyOrmEntity);
//# sourceMappingURL=company.orm-entity.js.map