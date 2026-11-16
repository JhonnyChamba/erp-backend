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
exports.EmissionPointSequenceOrmEntity = exports.EmissionPointOrmEntity = void 0;
const typeorm_1 = require("typeorm");
const company_orm_entity_1 = require("../../../company/infrastructure/persistence/company.orm-entity");
const branch_company_orm_entity_1 = require("../../../branch-company/infrastructure/persistence/branch-company.orm-entity");
let EmissionPointOrmEntity = class EmissionPointOrmEntity {
    id;
    company;
    branch;
    description;
    serie;
    enabled;
    deleted;
    created_by;
    sequences;
    created_at;
    updated_at;
};
exports.EmissionPointOrmEntity = EmissionPointOrmEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], EmissionPointOrmEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => company_orm_entity_1.CompanyOrmEntity, { nullable: false, onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'company_id' }),
    __metadata("design:type", company_orm_entity_1.CompanyOrmEntity)
], EmissionPointOrmEntity.prototype, "company", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => branch_company_orm_entity_1.BranchCompanyOrmEntity, { nullable: false, onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'branch_id' }),
    __metadata("design:type", branch_company_orm_entity_1.BranchCompanyOrmEntity)
], EmissionPointOrmEntity.prototype, "branch", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 150 }),
    __metadata("design:type", String)
], EmissionPointOrmEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 10 }),
    __metadata("design:type", String)
], EmissionPointOrmEntity.prototype, "serie", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], EmissionPointOrmEntity.prototype, "enabled", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], EmissionPointOrmEntity.prototype, "deleted", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], EmissionPointOrmEntity.prototype, "created_by", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => EmissionPointSequenceOrmEntity, (s) => s.emission_point, { cascade: true }),
    __metadata("design:type", Array)
], EmissionPointOrmEntity.prototype, "sequences", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], EmissionPointOrmEntity.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], EmissionPointOrmEntity.prototype, "updated_at", void 0);
exports.EmissionPointOrmEntity = EmissionPointOrmEntity = __decorate([
    (0, typeorm_1.Index)(['company', 'branch', 'serie'], { unique: true }),
    (0, typeorm_1.Entity)('tab_emission_point')
], EmissionPointOrmEntity);
let EmissionPointSequenceOrmEntity = class EmissionPointSequenceOrmEntity {
    id;
    company;
    emission_point;
    document_type;
    document_code;
    serie;
    correlative;
    enabled;
    created_at;
    updated_at;
};
exports.EmissionPointSequenceOrmEntity = EmissionPointSequenceOrmEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], EmissionPointSequenceOrmEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => company_orm_entity_1.CompanyOrmEntity, { nullable: false, onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'company_id' }),
    __metadata("design:type", company_orm_entity_1.CompanyOrmEntity)
], EmissionPointSequenceOrmEntity.prototype, "company", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => EmissionPointOrmEntity, (p) => p.sequences, { nullable: false, onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'emission_point_id' }),
    __metadata("design:type", EmissionPointOrmEntity)
], EmissionPointSequenceOrmEntity.prototype, "emission_point", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50 }),
    __metadata("design:type", String)
], EmissionPointSequenceOrmEntity.prototype, "document_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 10 }),
    __metadata("design:type", String)
], EmissionPointSequenceOrmEntity.prototype, "document_code", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 10 }),
    __metadata("design:type", String)
], EmissionPointSequenceOrmEntity.prototype, "serie", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], EmissionPointSequenceOrmEntity.prototype, "correlative", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], EmissionPointSequenceOrmEntity.prototype, "enabled", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], EmissionPointSequenceOrmEntity.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], EmissionPointSequenceOrmEntity.prototype, "updated_at", void 0);
exports.EmissionPointSequenceOrmEntity = EmissionPointSequenceOrmEntity = __decorate([
    (0, typeorm_1.Index)(['emission_point', 'document_type'], { unique: true }),
    (0, typeorm_1.Entity)('tab_emission_point_sequence')
], EmissionPointSequenceOrmEntity);
//# sourceMappingURL=emission-point.orm-entity.js.map