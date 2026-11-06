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
exports.RolesController = void 0;
const create_roles_use_case_1 = require("../application/use-cases/create-roles.use-case");
const update_roles_use_case_1 = require("../application/use-cases/update-roles.use-case");
const common_1 = require("@nestjs/common");
const list_roles_use_case_1 = require("../application/use-cases/list-roles.use-case");
const get_roles_use_case_1 = require("../application/use-cases/get-roles.use-case");
const create_roles_dto_1 = require("../application/dto/create-roles.dto");
const update_roles_dto_1 = require("../application/dto/update-roles.dto");
const list_roles_dto_1 = require("../application/dto/list-roles.dto");
const passport_1 = require("@nestjs/passport");
let RolesController = class RolesController {
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
    resolveCompanyId(req, explicitId) {
        const headerVal = req?.headers?.['x-company-id'];
        const candidate = explicitId || Number(headerVal) || Number(req?.companyId) || Number(req?.user?.company_id) || 1;
        return !Number.isNaN(candidate) && candidate > 0 ? candidate : 1;
    }
    create(dto, req) {
        dto.companyId = this.resolveCompanyId(req, dto.companyId);
        return this.createUseCase.execute(dto, req.user);
    }
    list(query, req) {
        query.companyId = this.resolveCompanyId(req, query.companyId);
        return this.listUseCase.execute(query, req.user);
    }
    get(id, req) {
        return this.getUseCase.execute(Number(id), this.resolveCompanyId(req));
    }
    update(id, dto, req) {
        const targetCompanyId = this.resolveCompanyId(req, dto.companyId);
        return this.updateUseCase.execute(Number(id), targetCompanyId, dto);
    }
};
exports.RolesController = RolesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_roles_dto_1.CreateRolesDto, Object]),
    __metadata("design:returntype", void 0)
], RolesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [list_roles_dto_1.ListRolesDto, Object]),
    __metadata("design:returntype", void 0)
], RolesController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], RolesController.prototype, "get", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_roles_dto_1.UpdateRolesDto, Object]),
    __metadata("design:returntype", void 0)
], RolesController.prototype, "update", null);
exports.RolesController = RolesController = __decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Controller)('roles'),
    __metadata("design:paramtypes", [create_roles_use_case_1.CreateRolesUseCase,
        list_roles_use_case_1.ListRolesUseCase,
        get_roles_use_case_1.GetRolesUseCase,
        update_roles_use_case_1.UpdateRolesUseCase])
], RolesController);
//# sourceMappingURL=roles.controller.js.map