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
exports.CreateModuleUseCase = void 0;
const module_repository_1 = require("../../domain/repositories/module.repository");
const module_entity_1 = require("../../domain/entities/module.entity");
const common_1 = require("@nestjs/common");
let CreateModuleUseCase = class CreateModuleUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(dto, user) {
        const branch = new module_entity_1.Module(null, dto.code, dto.desc_icon, dto.description, true, undefined, user.user_id);
        return this.repository.create(branch);
    }
};
exports.CreateModuleUseCase = CreateModuleUseCase;
exports.CreateModuleUseCase = CreateModuleUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [module_repository_1.ModuleRepository])
], CreateModuleUseCase);
//# sourceMappingURL=create-module.use-case.js.map