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
exports.AuthController = void 0;
const company_access_guard_1 = require("./guards/company-access.guard");
const create_users_use_case_1 = require("../modules/users/application/use-cases/create-users.use-case");
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const users_orm_entity_1 = require("../modules/users/infrastructure/persistence/users.orm-entity");
const passport_1 = require("@nestjs/passport");
const auth_service_1 = require("./auth.service");
const access_control_service_1 = require("./access-control.service");
let AuthController = class AuthController {
    authService;
    createUsersUseCase;
    accessControlService;
    usersRepo;
    constructor(authService, createUsersUseCase, accessControlService, usersRepo) {
        this.authService = authService;
        this.createUsersUseCase = createUsersUseCase;
        this.accessControlService = accessControlService;
        this.usersRepo = usersRepo;
    }
    async register(body) {
        return this.createUsersUseCase.execute(body);
    }
    async login(body) {
        return this.authService.login(body.email, body.password);
    }
    async me(req) {
        const user = await this.usersRepo.findOne({
            where: { id: Number(req.user?.user_id), deleted: false },
            relations: ['company'],
        });
        if (!user)
            throw new common_1.NotFoundException('Usuario no encontrado');
        const access = await this.accessControlService.getUserCompanyAccess(req.user, Number(user.company?.id || req.user?.company_id || 1));
        const isSuperAdmin = Boolean(user.super_admin || user.developer);
        return {
            id: user.id,
            num_document: user.num_document,
            name_user: user.name_user,
            last_name_user: user.last_name_user,
            full_name: `${user.name_user} ${user.last_name_user}`.trim(),
            email: user.email,
            birth_date: user.birth_date ?? null,
            photo_url: user.photo_url || null,
            enabled: user.enabled,
            super_admin: isSuperAdmin,
            multi_company: !isSuperAdmin && Boolean(user.multi_company),
            role_name: access.roleName,
            company_name: user.company?.trade_name || user.company?.business_name || null,
            created_at: user.created_at,
        };
    }
    async getAccess(queryCompanyId, headerCompanyId, req) {
        const companyId = Number(queryCompanyId || headerCompanyId || req.user?.company_id || 1);
        return this.accessControlService.getUserCompanyAccess(req.user, companyId, true);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Get)('me'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "me", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), company_access_guard_1.CompanyAccessGuard),
    (0, common_1.Get)('access'),
    __param(0, (0, common_1.Query)('companyId')),
    __param(1, (0, common_1.Headers)('x-company-id')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getAccess", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __param(3, (0, typeorm_1.InjectRepository)(users_orm_entity_1.UsersOrmEntity)),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        create_users_use_case_1.CreateUsersUseCase,
        access_control_service_1.AccessControlService,
        typeorm_2.Repository])
], AuthController);
//# sourceMappingURL=auth.controller.js.map