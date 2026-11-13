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
exports.subModulesOrmEntity = void 0;
const typeorm_1 = require("typeorm");
const module_orm_entity_1 = require("../../../module/infrastructure/persistence/module.orm-entity");
let subModulesOrmEntity = class subModulesOrmEntity {
    id;
    code;
    desc_icon;
    description;
    url_desc;
    order_index;
    module;
    created_by;
    enabled;
    deleted;
    created_at;
};
exports.subModulesOrmEntity = subModulesOrmEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], subModulesOrmEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20 }),
    __metadata("design:type", String)
], subModulesOrmEntity.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], subModulesOrmEntity.prototype, "desc_icon", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 150 }),
    __metadata("design:type", String)
], subModulesOrmEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], subModulesOrmEntity.prototype, "url_desc", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'order_index', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], subModulesOrmEntity.prototype, "order_index", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => module_orm_entity_1.ModuleOrmEntity, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'module_id' }),
    __metadata("design:type", module_orm_entity_1.ModuleOrmEntity)
], subModulesOrmEntity.prototype, "module", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], subModulesOrmEntity.prototype, "created_by", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], subModulesOrmEntity.prototype, "enabled", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], subModulesOrmEntity.prototype, "deleted", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], subModulesOrmEntity.prototype, "created_at", void 0);
exports.subModulesOrmEntity = subModulesOrmEntity = __decorate([
    (0, typeorm_1.Entity)('tab_sub_module')
], subModulesOrmEntity);
//# sourceMappingURL=sub-module.orm-entity.js.map