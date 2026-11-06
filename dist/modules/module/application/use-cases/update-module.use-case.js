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
exports.UpdateModuleUseCase = void 0;
const module_repository_1 = require("../../domain/repositories/module.repository");
const common_1 = require("@nestjs/common");
let UpdateModuleUseCase = class UpdateModuleUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(id, dto) {
        const branch = await this.repository.findById(id);
        if (!branch)
            throw new Error('Module not found');
        branch.code = dto.code ?? branch.code;
        branch.desc_icon = dto.desc_icon ?? branch.desc_icon;
        branch.description = dto.description ?? branch.description;
        branch.enabled = dto.enabled ?? branch.enabled;
        return this.repository.update(branch);
    }
};
exports.UpdateModuleUseCase = UpdateModuleUseCase;
exports.UpdateModuleUseCase = UpdateModuleUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [module_repository_1.ModuleRepository])
], UpdateModuleUseCase);
//# sourceMappingURL=update-module.use-case.js.map