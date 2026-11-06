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
exports.CreateRolesTemplatesUseCase = void 0;
const roles_templates_repository_1 = require("../../domain/repositories/roles-templates.repository");
const roles_templates_entity_1 = require("../../domain/entities/roles-templates.entity");
const common_1 = require("@nestjs/common");
let CreateRolesTemplatesUseCase = class CreateRolesTemplatesUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(dto, user) {
        const branch = new roles_templates_entity_1.RolesTemplates(null, dto.code, dto.description, true, undefined, user.user_id);
        return this.repository.create(branch);
    }
};
exports.CreateRolesTemplatesUseCase = CreateRolesTemplatesUseCase;
exports.CreateRolesTemplatesUseCase = CreateRolesTemplatesUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [roles_templates_repository_1.RolesTemplatesRepository])
], CreateRolesTemplatesUseCase);
//# sourceMappingURL=create-roles-templates.use-case.js.map