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
exports.UpdatePlansModulesUseCase = void 0;
const plans_module_repository_1 = require("../../domain/repositories/plans-module.repository");
const common_1 = require("@nestjs/common");
let UpdatePlansModulesUseCase = class UpdatePlansModulesUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(id, planId, dto) {
        const subModule = await this.repository.findById(id, planId);
        if (!subModule)
            throw new Error('PlansModules not found');
        return this.repository.update(subModule);
    }
};
exports.UpdatePlansModulesUseCase = UpdatePlansModulesUseCase;
exports.UpdatePlansModulesUseCase = UpdatePlansModulesUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [plans_module_repository_1.PlansModulesRepository])
], UpdatePlansModulesUseCase);
//# sourceMappingURL=update-plans-module.use-case.js.map