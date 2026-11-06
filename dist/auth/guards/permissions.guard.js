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
exports.PermissionsGuard = exports.RequireAccess = exports.REQUIRE_ACCESS_KEY = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const access_control_service_1 = require("../access-control.service");
exports.REQUIRE_ACCESS_KEY = 'require_access_codes';
const RequireAccess = (...codes) => (0, common_1.SetMetadata)(exports.REQUIRE_ACCESS_KEY, codes);
exports.RequireAccess = RequireAccess;
let PermissionsGuard = class PermissionsGuard {
    reflector;
    accessControlService;
    constructor(reflector, accessControlService) {
        this.reflector = reflector;
        this.accessControlService = accessControlService;
    }
    async canActivate(context) {
        const requiredCodes = this.reflector.getAllAndOverride(exports.REQUIRE_ACCESS_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredCodes || requiredCodes.length === 0) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user) {
            throw new common_1.ForbiddenException('Usuario no autenticado');
        }
        const companyId = Number(request.headers['x-company-id'] ||
            request.query?.companyId ||
            request.body?.companyId ||
            user.company_id ||
            1);
        const access = await this.accessControlService.getUserCompanyAccess(user, companyId);
        if (access.isSuperAdmin) {
            return true;
        }
        const allowedCodes = new Set([
            ...access.moduleCodes.map((c) => c.toUpperCase()),
            ...access.subModuleCodes.map((c) => c.toUpperCase()),
        ]);
        const hasPermission = requiredCodes.some((code) => allowedCodes.has(code.toUpperCase()));
        if (!hasPermission) {
            throw new common_1.ForbiddenException(`No tienes permisos en esta empresa para acceder al recurso (${requiredCodes.join(', ')})`);
        }
        return true;
    }
};
exports.PermissionsGuard = PermissionsGuard;
exports.PermissionsGuard = PermissionsGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        access_control_service_1.AccessControlService])
], PermissionsGuard);
//# sourceMappingURL=permissions.guard.js.map