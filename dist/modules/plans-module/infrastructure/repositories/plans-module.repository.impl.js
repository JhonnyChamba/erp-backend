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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlansModulesRepositoryImpl = void 0;
const plans_module_orm_entity_1 = require("../persistence/plans-module.orm-entity");
const plans_module_entity_1 = require("../../domain/entities/plans-module.entity");
const typeorm_1 = require("@nestjs/typeorm");
const common_1 = require("@nestjs/common");
const typeorm_2 = require("typeorm");
let PlansModulesRepositoryImpl = class PlansModulesRepositoryImpl {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async create(subModule) {
        const entity = this.repo.create({
            plans: { id: subModule.planId },
            module: { id: subModule.moduleId },
        });
        const saved = await this.repo.save(entity);
        return this.toDomain(saved);
    }
    async findByCompany(planId, page, limit) {
        const [plansModules, total] = await this.repo.findAndCount({
            where: { plans: { id: planId } },
            skip: (page - 1) * limit,
            take: limit,
            order: { created_at: 'DESC' },
        });
        return {
            data: plansModules.map(subModule => this.toDomain(subModule)),
            total,
        };
    }
    async findById(id, planId) {
        const subModule = await this.repo.findOne({ where: { id, plans: { id: planId } } });
        return subModule ? this.toDomain(subModule) : null;
    }
    async update(subModule) {
        await this.repo.update({ id: subModule.id, plans: { id: subModule.planId } }, { module: { id: subModule.moduleId } });
        const updated = await this.repo.findOne({
            where: {
                id: subModule.id,
                plans: { id: subModule.planId },
            },
        });
        return this.toDomain(updated);
    }
    toDomain(entity) {
        return new plans_module_entity_1.PlansModules(entity.id, entity.plans?.id, entity.module?.id);
    }
};
exports.PlansModulesRepositoryImpl = PlansModulesRepositoryImpl;
exports.PlansModulesRepositoryImpl = PlansModulesRepositoryImpl = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(plans_module_orm_entity_1.PlansModulesOrmEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], PlansModulesRepositoryImpl);
//# sourceMappingURL=plans-module.repository.impl.js.map