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
exports.EmployeeCategoryController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const company_access_guard_1 = require("../../../auth/guards/company-access.guard");
const employee_category_service_1 = require("../application/employee-category.service");
const employee_category_dto_1 = require("../application/dto/employee-category.dto");
let EmployeeCategoryController = class EmployeeCategoryController {
    categoryService;
    constructor(categoryService) {
        this.categoryService = categoryService;
    }
    resolveCompanyId(req, explicitId) {
        const headerVal = req?.headers?.['x-company-id'];
        const candidate = explicitId || Number(headerVal) || Number(req?.companyId) || Number(req?.user?.company_id) || 1;
        return !Number.isNaN(candidate) && candidate > 0 ? candidate : 1;
    }
    list(companyIdQuery, activeQuery, req) {
        const companyId = this.resolveCompanyId(req, companyIdQuery ? Number(companyIdQuery) : undefined);
        const activeOnly = activeQuery === 'true' || activeQuery === '1';
        return this.categoryService.list(companyId, activeOnly);
    }
    getById(id, companyIdQuery, req) {
        const companyId = this.resolveCompanyId(req, companyIdQuery ? Number(companyIdQuery) : undefined);
        return this.categoryService.getById(Number(id), companyId);
    }
    create(dto, companyIdQuery, req) {
        const companyId = this.resolveCompanyId(req, companyIdQuery ? Number(companyIdQuery) : undefined);
        return this.categoryService.create(companyId, dto);
    }
    update(id, dto, companyIdQuery, req) {
        const companyId = this.resolveCompanyId(req, companyIdQuery ? Number(companyIdQuery) : undefined);
        return this.categoryService.update(Number(id), companyId, dto);
    }
    toggleStatus(id, companyIdQuery, req) {
        const companyId = this.resolveCompanyId(req, companyIdQuery ? Number(companyIdQuery) : undefined);
        return this.categoryService.toggleStatus(Number(id), companyId);
    }
    remove(id, companyIdQuery, req) {
        const companyId = this.resolveCompanyId(req, companyIdQuery ? Number(companyIdQuery) : undefined);
        return this.categoryService.remove(Number(id), companyId);
    }
};
exports.EmployeeCategoryController = EmployeeCategoryController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('companyId')),
    __param(1, (0, common_1.Query)('active')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], EmployeeCategoryController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('companyId')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, Object]),
    __metadata("design:returntype", void 0)
], EmployeeCategoryController.prototype, "getById", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Query)('companyId')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [employee_category_dto_1.CreateEmployeeCategoryDto, String, Object]),
    __metadata("design:returntype", void 0)
], EmployeeCategoryController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Query)('companyId')),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, employee_category_dto_1.UpdateEmployeeCategoryDto, String, Object]),
    __metadata("design:returntype", void 0)
], EmployeeCategoryController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/toggle-status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('companyId')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, Object]),
    __metadata("design:returntype", void 0)
], EmployeeCategoryController.prototype, "toggleStatus", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('companyId')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, Object]),
    __metadata("design:returntype", void 0)
], EmployeeCategoryController.prototype, "remove", null);
exports.EmployeeCategoryController = EmployeeCategoryController = __decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), company_access_guard_1.CompanyAccessGuard),
    (0, common_1.Controller)('hr/categories'),
    __metadata("design:paramtypes", [employee_category_service_1.EmployeeCategoryService])
], EmployeeCategoryController);
//# sourceMappingURL=employee-category.controller.js.map