"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const users_module_1 = require("../modules/users/users.module");
const module_orm_entity_1 = require("../modules/module/infrastructure/persistence/module.orm-entity");
const sub_module_orm_entity_1 = require("../modules/sub-module/infrastructure/persistence/sub-module.orm-entity");
const subscriptions_orm_entity_1 = require("../modules/subscriptions/infrastructure/persistence/subscriptions.orm-entity");
const roles_orm_entity_1 = require("../modules/roles/infrastructure/persistence/roles.orm-entity");
const user_company_orm_entity_1 = require("../modules/user-company/infrastructure/persistence/user-company.orm-entity");
const users_orm_entity_1 = require("../modules/users/infrastructure/persistence/users.orm-entity");
const jwt_service_1 = require("./strategies/jwt/jwt.service");
const auth_controller_1 = require("./auth.controller");
const auth_service_1 = require("./auth.service");
const access_control_service_1 = require("./access-control.service");
const permissions_guard_1 = require("./guards/permissions.guard");
const company_access_guard_1 = require("./guards/company-access.guard");
const typeorm_1 = require("@nestjs/typeorm");
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [
            users_module_1.UsersModule,
            typeorm_1.TypeOrmModule.forFeature([
                module_orm_entity_1.ModuleOrmEntity,
                sub_module_orm_entity_1.subModulesOrmEntity,
                subscriptions_orm_entity_1.SubscriptionsOrmEntity,
                roles_orm_entity_1.RolesOrmEntity,
                roles_orm_entity_1.RoleModuleOrmEntity,
                user_company_orm_entity_1.UserCompanyOrmEntity,
                users_orm_entity_1.UsersOrmEntity,
            ]),
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    secret: config.getOrThrow('JWT_SECRET'),
                    signOptions: {
                        expiresIn: config.get('JWT_EXPIRES_IN', '1d'),
                    },
                }),
            }),
        ],
        controllers: [auth_controller_1.AuthController],
        providers: [auth_service_1.AuthService, jwt_service_1.JwtStrategy, access_control_service_1.AccessControlService, permissions_guard_1.PermissionsGuard, company_access_guard_1.CompanyAccessGuard],
        exports: [auth_service_1.AuthService, access_control_service_1.AccessControlService, permissions_guard_1.PermissionsGuard, company_access_guard_1.CompanyAccessGuard],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map