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
exports.RolesTemplatesController = void 0;
const company_access_guard_1 = require("../../../auth/guards/company-access.guard");
const create_roles_templates_use_case_1 = require("../application/use-cases/create-roles-templates.use-case");
const update_roles_templates_use_case_1 = require("../application/use-cases/update-roles-templates.use-case");
const common_1 = require("@nestjs/common");
const list_roles_templates_use_case_1 = require("../application/use-cases/list-roles-templates.use-case");
const get_roles_templates_use_case_1 = require("../application/use-cases/get-roles-templates.use-case");
const create_roles_templates_dto_1 = require("../application/dto/create-roles-templates.dto");
const update_roles_templates_dto_1 = require("../application/dto/update-roles-templates.dto");
const list_roles_templates_dto_1 = require("../application/dto/list-roles-templates.dto");
const passport_1 = require("@nestjs/passport");
let RolesTemplatesController = class RolesTemplatesController {
    createUseCase;
    listUseCase;
    getUseCase;
    updateUseCase;
    constructor(createUseCase, listUseCase, getUseCase, updateUseCase) {
        this.createUseCase = createUseCase;
        this.listUseCase = listUseCase;
        this.getUseCase = getUseCase;
        this.updateUseCase = updateUseCase;
    }
    create(dto, req) {
        return this.createUseCase.execute(dto, req.user);
    }
    list(query, req) {
        return this.listUseCase.execute(query, req.user);
    }
    get(id, req) {
        return this.getUseCase.execute(Number(id));
    }
    update(id, dto, req) {
        return this.updateUseCase.execute(Number(id), dto);
    }
};
exports.RolesTemplatesController = RolesTemplatesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_roles_templates_dto_1.CreateRolesTemplatesDto, Object]),
    __metadata("design:returntype", void 0)
], RolesTemplatesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [list_roles_templates_dto_1.ListRolesTemplatesDto, Object]),
    __metadata("design:returntype", void 0)
], RolesTemplatesController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], RolesTemplatesController.prototype, "get", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_roles_templates_dto_1.UpdateRolesTemplatesDto, Object]),
    __metadata("design:returntype", void 0)
], RolesTemplatesController.prototype, "update", null);
exports.RolesTemplatesController = RolesTemplatesController = __decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), company_access_guard_1.CompanyAccessGuard),
    (0, common_1.Controller)('rolesTemplates'),
    __metadata("design:paramtypes", [create_roles_templates_use_case_1.CreateRolesTemplatesUseCase,
        list_roles_templates_use_case_1.ListRolesTemplatesUseCase,
        get_roles_templates_use_case_1.GetRolesTemplatesUseCase,
        update_roles_templates_use_case_1.UpdateRolesTemplatesUseCase])
], RolesTemplatesController);
//# sourceMappingURL=roles-templates.controller.js.map