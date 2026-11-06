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
exports.UpdatesubModulesUseCase = void 0;
const sub_module_repository_1 = require("../../domain/repositories/sub-module.repository");
const common_1 = require("@nestjs/common");
let UpdatesubModulesUseCase = class UpdatesubModulesUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(id, moduleId, dto) {
        const subModule = await this.repository.findById(id, moduleId);
        if (!subModule)
            throw new Error('subModules not found');
        subModule.moduleId = dto.moduleId ?? subModule.moduleId;
        subModule.code = dto.code ?? subModule.code;
        subModule.desc_icon = dto.desc_icon ?? subModule.desc_icon;
        subModule.description = dto.description ?? subModule.description;
        subModule.url_desc = dto.url_desc ?? subModule.url_desc;
        subModule.enabled = dto.enabled ?? subModule.enabled;
        return this.repository.update(subModule);
    }
};
exports.UpdatesubModulesUseCase = UpdatesubModulesUseCase;
exports.UpdatesubModulesUseCase = UpdatesubModulesUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [sub_module_repository_1.subModulesRepository])
], UpdatesubModulesUseCase);
//# sourceMappingURL=update-sub-module.use-case.js.map