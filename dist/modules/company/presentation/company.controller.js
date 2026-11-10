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
exports.CompanyController = void 0;
const access_control_service_1 = require("../../../auth/access-control.service");
const common_1 = require("@nestjs/common");
const company_access_guard_1 = require("../../../auth/guards/company-access.guard");
const create_company_use_case_1 = require("../application/use-cases/create-company.use-case");
const update_company_use_case_1 = require("../application/use-cases/update-company.use-case");
const common_2 = require("@nestjs/common");
const list_company_use_case_1 = require("../application/use-cases/list-company.use-case");
const get_company_use_case_1 = require("../application/use-cases/get-company.use-case");
const create_company_dto_1 = require("../application/dto/create-company.dto");
const update_company_dto_1 = require("../application/dto/update-company.dto");
const list_company_dto_1 = require("../application/dto/list-company.dto");
const passport_1 = require("@nestjs/passport");
let CompanyController = class CompanyController {
    createUseCase;
    listUseCase;
    getUseCase;
    updateUseCase;
    accessControlService;
    constructor(createUseCase, listUseCase, getUseCase, updateUseCase, accessControlService) {
        this.createUseCase = createUseCase;
        this.listUseCase = listUseCase;
        this.getUseCase = getUseCase;
        this.updateUseCase = updateUseCase;
        this.accessControlService = accessControlService;
    }
    async assertCompanyAccess(user, companyId) {
        if (!(await this.accessControlService.canAccessCompany(user, companyId))) {
            throw new common_1.ForbiddenException('No tienes acceso a la empresa indicada');
        }
    }
    create(dto, req) {
        return this.createUseCase.execute(dto, req.user);
    }
    list(query, req) {
        return this.listUseCase.execute(query, req.user);
    }
    async get(id, req) {
        await this.assertCompanyAccess(req.user, Number(id));
        return this.getUseCase.execute(Number(id));
    }
    async update(id, dto, req) {
        await this.assertCompanyAccess(req.user, Number(id));
        return this.updateUseCase.execute(Number(id), dto);
    }
};
exports.CompanyController = CompanyController;
__decorate([
    (0, common_2.Post)('register'),
    __param(0, (0, common_2.Body)()),
    __param(1, (0, common_2.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_company_dto_1.CreateCompanyDto, Object]),
    __metadata("design:returntype", void 0)
], CompanyController.prototype, "create", null);
__decorate([
    (0, common_2.Get)(),
    __param(0, (0, common_2.Query)()),
    __param(1, (0, common_2.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [list_company_dto_1.ListCompanyDto, Object]),
    __metadata("design:returntype", void 0)
], CompanyController.prototype, "list", null);
__decorate([
    (0, common_2.Get)(':id'),
    __param(0, (0, common_2.Param)('id')),
    __param(1, (0, common_2.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], CompanyController.prototype, "get", null);
__decorate([
    (0, common_2.Patch)(':id'),
    __param(0, (0, common_2.Param)('id')),
    __param(1, (0, common_2.Body)()),
    __param(2, (0, common_2.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_company_dto_1.UpdateCompanyDto, Object]),
    __metadata("design:returntype", Promise)
], CompanyController.prototype, "update", null);
exports.CompanyController = CompanyController = __decorate([
    (0, common_2.UseGuards)((0, passport_1.AuthGuard)('jwt'), company_access_guard_1.CompanyAccessGuard),
    (0, common_2.Controller)('company'),
    __metadata("design:paramtypes", [create_company_use_case_1.CreateCompanyUseCase,
        list_company_use_case_1.ListCompanyUseCase,
        get_company_use_case_1.GetCompanyUseCase,
        update_company_use_case_1.UpdateCompanyUseCase,
        access_control_service_1.AccessControlService])
], CompanyController);
//# sourceMappingURL=company.controller.js.map