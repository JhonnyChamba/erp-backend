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
exports.CompanyAccessGuard = void 0;
const common_1 = require("@nestjs/common");
const access_control_service_1 = require("../access-control.service");
let CompanyAccessGuard = class CompanyAccessGuard {
    accessControlService;
    constructor(accessControlService) {
        this.accessControlService = accessControlService;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user)
            throw new common_1.ForbiddenException('Usuario no autenticado');
        const provided = [request.headers?.['x-company-id'], request.query?.companyId, request.body?.companyId]
            .filter((v) => v !== undefined && v !== null && v !== '')
            .map((v) => Number(Array.isArray(v) ? v[0] : v));
        const candidates = provided.length ? provided : [Number(user.company_id || 1)];
        for (const companyId of new Set(candidates)) {
            if (!Number.isInteger(companyId) || companyId <= 0)
                throw new common_1.ForbiddenException('Empresa no válida');
            if (!(await this.accessControlService.canAccessCompany(user, companyId))) {
                throw new common_1.ForbiddenException('No tienes acceso a la empresa indicada');
            }
        }
        request.companyId = candidates[0];
        return true;
    }
};
exports.CompanyAccessGuard = CompanyAccessGuard;
exports.CompanyAccessGuard = CompanyAccessGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [access_control_service_1.AccessControlService])
], CompanyAccessGuard);
//# sourceMappingURL=company-access.guard.js.map