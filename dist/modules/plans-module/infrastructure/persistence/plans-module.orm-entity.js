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
exports.PlansModulesOrmEntity = void 0;
const typeorm_1 = require("typeorm");
const module_orm_entity_1 = require("../../../module/infrastructure/persistence/module.orm-entity");
const plans_orm_entity_1 = require("../../../plans/infrastructure/persistence/plans.orm-entity");
let PlansModulesOrmEntity = class PlansModulesOrmEntity {
    id;
    plans;
    module;
    created_at;
};
exports.PlansModulesOrmEntity = PlansModulesOrmEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], PlansModulesOrmEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => plans_orm_entity_1.PlansOrmEntity, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'plans_id' }),
    __metadata("design:type", plans_orm_entity_1.PlansOrmEntity)
], PlansModulesOrmEntity.prototype, "plans", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => module_orm_entity_1.ModuleOrmEntity, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'module_id' }),
    __metadata("design:type", module_orm_entity_1.ModuleOrmEntity)
], PlansModulesOrmEntity.prototype, "module", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], PlansModulesOrmEntity.prototype, "created_at", void 0);
exports.PlansModulesOrmEntity = PlansModulesOrmEntity = __decorate([
    (0, typeorm_1.Entity)('tab_plans_module')
], PlansModulesOrmEntity);
//# sourceMappingURL=plans-module.orm-entity.js.map