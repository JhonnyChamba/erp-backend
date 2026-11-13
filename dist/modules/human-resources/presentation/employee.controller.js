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
exports.EmployeeController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const company_access_guard_1 = require("../../../auth/guards/company-access.guard");
const employee_service_1 = require("../application/employee.service");
const employee_dto_1 = require("./../application/dto/employee.dto");
let EmployeeController = class EmployeeController {
    employeeService;
    constructor(employeeService) {
        this.employeeService = employeeService;
    }
    resolveCompanyId(req, explicitId) {
        const headerVal = req?.headers?.['x-company-id'];
        const candidate = explicitId || Number(headerVal) || Number(req?.companyId) || Number(req?.user?.company_id) || 1;
        return !Number.isNaN(candidate) && candidate > 0 ? candidate : 1;
    }
    list(companyIdQuery, branchIdQuery, categoryIdQuery, acceptsAppointmentsQuery, statusQuery, searchQuery, req) {
        const companyId = this.resolveCompanyId(req, companyIdQuery ? Number(companyIdQuery) : undefined);
        const branchId = branchIdQuery ? Number(branchIdQuery) : undefined;
        const categoryId = categoryIdQuery ? Number(categoryIdQuery) : undefined;
        const acceptsAppointments = acceptsAppointmentsQuery !== undefined && acceptsAppointmentsQuery !== ''
            ? acceptsAppointmentsQuery === 'true' || acceptsAppointmentsQuery === '1'
            : undefined;
        return this.employeeService.list(companyId, {
            branchId,
            categoryId,
            acceptsAppointments,
            status: statusQuery,
            search: searchQuery,
        });
    }
    getById(id, companyIdQuery, req) {
        const companyId = this.resolveCompanyId(req, companyIdQuery ? Number(companyIdQuery) : undefined);
        return this.employeeService.getById(Number(id), companyId);
    }
    create(dto, companyIdQuery, req) {
        const companyId = this.resolveCompanyId(req, companyIdQuery ? Number(companyIdQuery) : undefined);
        return this.employeeService.create(companyId, dto);
    }
    update(id, dto, companyIdQuery, req) {
        const companyId = this.resolveCompanyId(req, companyIdQuery ? Number(companyIdQuery) : undefined);
        return this.employeeService.update(Number(id), companyId, dto);
    }
    toggleStatus(id, companyIdQuery, req) {
        const companyId = this.resolveCompanyId(req, companyIdQuery ? Number(companyIdQuery) : undefined);
        return this.employeeService.toggleStatus(Number(id), companyId);
    }
    remove(id, companyIdQuery, req) {
        const companyId = this.resolveCompanyId(req, companyIdQuery ? Number(companyIdQuery) : undefined);
        return this.employeeService.remove(Number(id), companyId);
    }
};
exports.EmployeeController = EmployeeController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('companyId')),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Query)('categoryId')),
    __param(3, (0, common_1.Query)('acceptsAppointments')),
    __param(4, (0, common_1.Query)('status')),
    __param(5, (0, common_1.Query)('search')),
    __param(6, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, Object]),
    __metadata("design:returntype", void 0)
], EmployeeController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('companyId')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, Object]),
    __metadata("design:returntype", void 0)
], EmployeeController.prototype, "getById", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Query)('companyId')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [employee_dto_1.CreateEmployeeDto, String, Object]),
    __metadata("design:returntype", void 0)
], EmployeeController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Query)('companyId')),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, employee_dto_1.UpdateEmployeeDto, String, Object]),
    __metadata("design:returntype", void 0)
], EmployeeController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/toggle-status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('companyId')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, Object]),
    __metadata("design:returntype", void 0)
], EmployeeController.prototype, "toggleStatus", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('companyId')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, Object]),
    __metadata("design:returntype", void 0)
], EmployeeController.prototype, "remove", null);
exports.EmployeeController = EmployeeController = __decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), company_access_guard_1.CompanyAccessGuard),
    (0, common_1.Controller)('hr/employees'),
    __metadata("design:paramtypes", [employee_service_1.EmployeeService])
], EmployeeController);
//# sourceMappingURL=employee.controller.js.map