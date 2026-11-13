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
exports.DocumentTypeOrmEntity = void 0;
const typeorm_1 = require("typeorm");
const company_orm_entity_1 = require("../../../company/infrastructure/persistence/company.orm-entity");
let DocumentTypeOrmEntity = class DocumentTypeOrmEntity {
    id;
    company_id;
    company;
    name;
    type;
    code;
    status;
    deleted;
    created_at;
    updated_at;
};
exports.DocumentTypeOrmEntity = DocumentTypeOrmEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], DocumentTypeOrmEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'company_id', nullable: true }),
    __metadata("design:type", Number)
], DocumentTypeOrmEntity.prototype, "company_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => company_orm_entity_1.CompanyOrmEntity, { nullable: true, onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'company_id' }),
    __metadata("design:type", company_orm_entity_1.CompanyOrmEntity)
], DocumentTypeOrmEntity.prototype, "company", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 150 }),
    __metadata("design:type", String)
], DocumentTypeOrmEntity.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, default: 'TODOS' }),
    __metadata("design:type", String)
], DocumentTypeOrmEntity.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20 }),
    __metadata("design:type", String)
], DocumentTypeOrmEntity.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, default: 'ACTIVO' }),
    __metadata("design:type", String)
], DocumentTypeOrmEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], DocumentTypeOrmEntity.prototype, "deleted", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], DocumentTypeOrmEntity.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], DocumentTypeOrmEntity.prototype, "updated_at", void 0);
exports.DocumentTypeOrmEntity = DocumentTypeOrmEntity = __decorate([
    (0, typeorm_1.Index)(['code', 'type'], { unique: true, where: '"deleted" = false' }),
    (0, typeorm_1.Entity)('tab_document_types')
], DocumentTypeOrmEntity);
//# sourceMappingURL=document-type.orm-entity.js.map