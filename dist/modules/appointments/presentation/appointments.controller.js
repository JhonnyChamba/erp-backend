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
exports.AppointmentsController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const company_access_guard_1 = require("../../../auth/guards/company-access.guard");
const appointments_service_1 = require("../application/appointments.service");
const appointment_dto_1 = require("../application/dto/appointment.dto");
let AppointmentsController = class AppointmentsController {
    appointmentsService;
    constructor(appointmentsService) {
        this.appointmentsService = appointmentsService;
    }
    resolveCompanyId(req, explicitId) {
        const headerVal = req?.headers?.['x-company-id'];
        const candidate = explicitId || Number(headerVal) || Number(req?.companyId) || Number(req?.user?.company_id) || 1;
        return !Number.isNaN(candidate) && candidate > 0 ? candidate : 1;
    }
    list(companyIdQuery, branchIdQuery, employeeIdQuery, customerIdQuery, startDate, endDate, status, search, req) {
        const companyId = this.resolveCompanyId(req, companyIdQuery ? Number(companyIdQuery) : undefined);
        return this.appointmentsService.list(companyId, {
            branchId: branchIdQuery ? Number(branchIdQuery) : undefined,
            employeeId: employeeIdQuery ? Number(employeeIdQuery) : undefined,
            customerId: customerIdQuery ? Number(customerIdQuery) : undefined,
            startDate,
            endDate,
            status,
            search,
        });
    }
    calendar(companyIdQuery, startDate, endDate, employeeIdQuery, branchIdQuery, req) {
        const companyId = this.resolveCompanyId(req, companyIdQuery ? Number(companyIdQuery) : undefined);
        const today = new Date().toISOString().split('T')[0];
        return this.appointmentsService.getCalendarEvents(companyId, {
            startDate: startDate || today,
            endDate: endDate || today,
            employeeId: employeeIdQuery ? Number(employeeIdQuery) : undefined,
            branchId: branchIdQuery ? Number(branchIdQuery) : undefined,
        });
    }
    getSchedules(companyIdQuery, employeeIdQuery, req) {
        const companyId = this.resolveCompanyId(req, companyIdQuery ? Number(companyIdQuery) : undefined);
        return this.appointmentsService.getEmployeeSchedules(companyId, employeeIdQuery ? Number(employeeIdQuery) : undefined);
    }
    saveSchedules(dto, req) {
        const companyId = this.resolveCompanyId(req);
        return this.appointmentsService.saveEmployeeSchedules(companyId, dto);
    }
    getById(id, companyIdQuery, req) {
        const companyId = this.resolveCompanyId(req, companyIdQuery ? Number(companyIdQuery) : undefined);
        return this.appointmentsService.getById(Number(id), companyId);
    }
    create(dto, req) {
        const companyId = this.resolveCompanyId(req);
        return this.appointmentsService.create(companyId, dto);
    }
    update(id, dto, req) {
        const companyId = this.resolveCompanyId(req);
        return this.appointmentsService.update(Number(id), companyId, dto);
    }
    changeStatus(id, dto, req) {
        const companyId = this.resolveCompanyId(req);
        return this.appointmentsService.changeStatus(Number(id), companyId, dto.status, dto.invoice_id);
    }
    delete(id, req) {
        const companyId = this.resolveCompanyId(req);
        return this.appointmentsService.delete(Number(id), companyId);
    }
};
exports.AppointmentsController = AppointmentsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('companyId')),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Query)('employeeId')),
    __param(3, (0, common_1.Query)('customerId')),
    __param(4, (0, common_1.Query)('startDate')),
    __param(5, (0, common_1.Query)('endDate')),
    __param(6, (0, common_1.Query)('status')),
    __param(7, (0, common_1.Query)('search')),
    __param(8, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String, String, Object]),
    __metadata("design:returntype", void 0)
], AppointmentsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('calendar'),
    __param(0, (0, common_1.Query)('companyId')),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __param(3, (0, common_1.Query)('employeeId')),
    __param(4, (0, common_1.Query)('branchId')),
    __param(5, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, Object]),
    __metadata("design:returntype", void 0)
], AppointmentsController.prototype, "calendar", null);
__decorate([
    (0, common_1.Get)('schedules'),
    __param(0, (0, common_1.Query)('companyId')),
    __param(1, (0, common_1.Query)('employeeId')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], AppointmentsController.prototype, "getSchedules", null);
__decorate([
    (0, common_1.Post)('schedules'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [appointment_dto_1.SaveEmployeeScheduleDto, Object]),
    __metadata("design:returntype", void 0)
], AppointmentsController.prototype, "saveSchedules", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('companyId')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], AppointmentsController.prototype, "getById", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [appointment_dto_1.CreateAppointmentDto, Object]),
    __metadata("design:returntype", void 0)
], AppointmentsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, appointment_dto_1.UpdateAppointmentDto, Object]),
    __metadata("design:returntype", void 0)
], AppointmentsController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, appointment_dto_1.UpdateAppointmentStatusDto, Object]),
    __metadata("design:returntype", void 0)
], AppointmentsController.prototype, "changeStatus", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AppointmentsController.prototype, "delete", null);
exports.AppointmentsController = AppointmentsController = __decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), company_access_guard_1.CompanyAccessGuard),
    (0, common_1.Controller)('appointments'),
    __metadata("design:paramtypes", [appointments_service_1.AppointmentsService])
], AppointmentsController);
//# sourceMappingURL=appointments.controller.js.map