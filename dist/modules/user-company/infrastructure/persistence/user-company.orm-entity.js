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
exports.UserCompanyOrmEntity = void 0;
const company_orm_entity_1 = require("../../../company/infrastructure/persistence/company.orm-entity");
const users_orm_entity_1 = require("../../../users/infrastructure/persistence/users.orm-entity");
const typeorm_1 = require("typeorm");
let UserCompanyOrmEntity = class UserCompanyOrmEntity {
    id;
    user;
    company;
    enabled;
    deleted;
    created_at;
};
exports.UserCompanyOrmEntity = UserCompanyOrmEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], UserCompanyOrmEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => users_orm_entity_1.UsersOrmEntity, (u) => u.userCompanies),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", users_orm_entity_1.UsersOrmEntity)
], UserCompanyOrmEntity.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => company_orm_entity_1.CompanyOrmEntity),
    (0, typeorm_1.JoinColumn)({ name: 'company_id' }),
    __metadata("design:type", company_orm_entity_1.CompanyOrmEntity)
], UserCompanyOrmEntity.prototype, "company", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], UserCompanyOrmEntity.prototype, "enabled", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], UserCompanyOrmEntity.prototype, "deleted", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], UserCompanyOrmEntity.prototype, "created_at", void 0);
exports.UserCompanyOrmEntity = UserCompanyOrmEntity = __decorate([
    (0, typeorm_1.Entity)('tab_users_company')
], UserCompanyOrmEntity);
//# sourceMappingURL=user-company.orm-entity.js.map