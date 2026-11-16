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
exports.CreatesubModulesUseCase = void 0;
const sub_module_repository_1 = require("../../domain/repositories/sub-module.repository");
const sub_module_entity_1 = require("../../domain/entities/sub-module.entity");
const common_1 = require("@nestjs/common");
let CreatesubModulesUseCase = class CreatesubModulesUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(dto, user) {
        const subModule = new sub_module_entity_1.subModules(null, dto.code, dto.desc_icon, dto.description, dto.url_desc, dto.moduleId, true, undefined, user.user_id);
        return this.repository.create(subModule);
    }
};
exports.CreatesubModulesUseCase = CreatesubModulesUseCase;
exports.CreatesubModulesUseCase = CreatesubModulesUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [sub_module_repository_1.subModulesRepository])
], CreatesubModulesUseCase);
//# sourceMappingURL=create-sub-module.use-case.js.map