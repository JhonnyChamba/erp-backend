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
exports.UsersOrmEntity = void 0;
const typeorm_1 = require("typeorm");
const company_orm_entity_1 = require("../../../company/infrastructure/persistence/company.orm-entity");
const user_company_orm_entity_1 = require("../../../user-company/infrastructure/persistence/user-company.orm-entity");
const roles_orm_entity_1 = require("../../../roles/infrastructure/persistence/roles.orm-entity");
let UsersOrmEntity = class UsersOrmEntity {
    id;
    company;
    role;
    userCompanies;
    num_document;
    name_user;
    last_name_user;
    email;
    password;
    developer;
    super_admin;
    multi_company;
    enabled;
    deleted;
    theme_color;
    birth_date;
    created_at;
};
exports.UsersOrmEntity = UsersOrmEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], UsersOrmEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => company_orm_entity_1.CompanyOrmEntity, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'company_id' }),
    __metadata("design:type", company_orm_entity_1.CompanyOrmEntity)
], UsersOrmEntity.prototype, "company", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => roles_orm_entity_1.RolesOrmEntity, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'role_id' }),
    __metadata("design:type", roles_orm_entity_1.RolesOrmEntity)
], UsersOrmEntity.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => user_company_orm_entity_1.UserCompanyOrmEntity, (uc) => uc.user),
    __metadata("design:type", Array)
], UsersOrmEntity.prototype, "userCompanies", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], UsersOrmEntity.prototype, "num_document", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], UsersOrmEntity.prototype, "name_user", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], UsersOrmEntity.prototype, "last_name_user", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], UsersOrmEntity.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], UsersOrmEntity.prototype, "password", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], UsersOrmEntity.prototype, "developer", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], UsersOrmEntity.prototype, "super_admin", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], UsersOrmEntity.prototype, "multi_company", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], UsersOrmEntity.prototype, "enabled", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], UsersOrmEntity.prototype, "deleted", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'Blue_Theme', nullable: true }),
    __metadata("design:type", String)
], UsersOrmEntity.prototype, "theme_color", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", String)
], UsersOrmEntity.prototype, "birth_date", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], UsersOrmEntity.prototype, "created_at", void 0);
exports.UsersOrmEntity = UsersOrmEntity = __decorate([
    (0, typeorm_1.Entity)('tab_users')
], UsersOrmEntity);
//# sourceMappingURL=users.orm-entity.js.map