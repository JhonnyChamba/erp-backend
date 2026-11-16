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
exports.CreatePlansModulesUseCase = void 0;
const plans_module_repository_1 = require("../../domain/repositories/plans-module.repository");
const plans_module_entity_1 = require("../../domain/entities/plans-module.entity");
const common_1 = require("@nestjs/common");
let CreatePlansModulesUseCase = class CreatePlansModulesUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(dto, user) {
        const subModule = new plans_module_entity_1.PlansModules(null, dto.planId, dto.moduleId);
        return this.repository.create(subModule);
    }
};
exports.CreatePlansModulesUseCase = CreatePlansModulesUseCase;
exports.CreatePlansModulesUseCase = CreatePlansModulesUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [plans_module_repository_1.PlansModulesRepository])
], CreatePlansModulesUseCase);
//# sourceMappingURL=create-plans-module.use-case.js.map