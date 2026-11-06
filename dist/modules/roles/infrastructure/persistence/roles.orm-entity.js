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
exports.RoleModuleOrmEntity = exports.RolesOrmEntity = void 0;
const typeorm_1 = require("typeorm");
const company_orm_entity_1 = require("../../../company/infrastructure/persistence/company.orm-entity");
const module_orm_entity_1 = require("../../../module/infrastructure/persistence/module.orm-entity");
const sub_module_orm_entity_1 = require("../../../sub-module/infrastructure/persistence/sub-module.orm-entity");
let RolesOrmEntity = class RolesOrmEntity {
    id;
    code;
    description;
    company;
    roleModules;
    created_by;
    enabled;
    deleted;
    created_at;
};
exports.RolesOrmEntity = RolesOrmEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], RolesOrmEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20 }),
    __metadata("design:type", String)
], RolesOrmEntity.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 150 }),
    __metadata("design:type", String)
], RolesOrmEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => company_orm_entity_1.CompanyOrmEntity, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'company_id' }),
    __metadata("design:type", company_orm_entity_1.CompanyOrmEntity)
], RolesOrmEntity.prototype, "company", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => RoleModuleOrmEntity, (rm) => rm.role),
    __metadata("design:type", Array)
], RolesOrmEntity.prototype, "roleModules", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], RolesOrmEntity.prototype, "created_by", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], RolesOrmEntity.prototype, "enabled", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], RolesOrmEntity.prototype, "deleted", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], RolesOrmEntity.prototype, "created_at", void 0);
exports.RolesOrmEntity = RolesOrmEntity = __decorate([
    (0, typeorm_1.Entity)('tab_role')
], RolesOrmEntity);
let RoleModuleOrmEntity = class RoleModuleOrmEntity {
    id;
    role;
    module;
    subModule;
    has_access;
    enabled;
    deleted;
    created_at;
};
exports.RoleModuleOrmEntity = RoleModuleOrmEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], RoleModuleOrmEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => RolesOrmEntity, (role) => role.roleModules, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: 'role_id' }),
    __metadata("design:type", RolesOrmEntity)
], RoleModuleOrmEntity.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => module_orm_entity_1.ModuleOrmEntity, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'module_id' }),
    __metadata("design:type", module_orm_entity_1.ModuleOrmEntity)
], RoleModuleOrmEntity.prototype, "module", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => sub_module_orm_entity_1.subModulesOrmEntity, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'sub_module_id' }),
    __metadata("design:type", sub_module_orm_entity_1.subModulesOrmEntity)
], RoleModuleOrmEntity.prototype, "subModule", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], RoleModuleOrmEntity.prototype, "has_access", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], RoleModuleOrmEntity.prototype, "enabled", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], RoleModuleOrmEntity.prototype, "deleted", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], RoleModuleOrmEntity.prototype, "created_at", void 0);
exports.RoleModuleOrmEntity = RoleModuleOrmEntity = __decorate([
    (0, typeorm_1.Entity)('tab_role_module')
], RoleModuleOrmEntity);
//# sourceMappingURL=roles.orm-entity.js.map