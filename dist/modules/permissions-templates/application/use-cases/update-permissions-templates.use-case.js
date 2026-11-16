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
exports.UpdatePermissionsTemplatesUseCase = void 0;
const permissions_templates_repository_1 = require("../../domain/repositories/permissions-templates.repository");
const common_1 = require("@nestjs/common");
let UpdatePermissionsTemplatesUseCase = class UpdatePermissionsTemplatesUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(id, dto) {
        const branch = await this.repository.findById(id);
        if (!branch)
            throw new Error('PermissionsTemplates not found');
        branch.code = dto.code ?? branch.code;
        branch.description = dto.description ?? branch.description;
        branch.enabled = dto.enabled ?? branch.enabled;
        return this.repository.update(branch);
    }
};
exports.UpdatePermissionsTemplatesUseCase = UpdatePermissionsTemplatesUseCase;
exports.UpdatePermissionsTemplatesUseCase = UpdatePermissionsTemplatesUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [permissions_templates_repository_1.PermissionsTemplatesRepository])
], UpdatePermissionsTemplatesUseCase);
//# sourceMappingURL=update-permissions-templates.use-case.js.map