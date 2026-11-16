"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersModule = void 0;
const login_get_users_use_case_1 = require("./application/use-cases/login-get-users.use-case");
const users_repository_impl_1 = require("./infrastructure/repositories/users.repository.impl");
const create_users_use_case_1 = require("./application/use-cases/create-users.use-case");
const update_users_use_case_1 = require("./application/use-cases/update-users.use-case");
const list_users_use_case_1 = require("./application/use-cases/list-users.use-case");
const users_orm_entity_1 = require("./infrastructure/persistence/users.orm-entity");
const user_company_orm_entity_1 = require("../user-company/infrastructure/persistence/user-company.orm-entity");
const get_users_use_case_1 = require("./application/use-cases/get-users.use-case");
const users_repository_1 = require("./domain/repositories/users.repository");
const users_controller_1 = require("./presentation/users.controller");
const typeorm_1 = require("@nestjs/typeorm");
const common_1 = require("@nestjs/common");
const password_module_1 = require("../../common/password/password.module");
let UsersModule = class UsersModule {
};
exports.UsersModule = UsersModule;
exports.UsersModule = UsersModule = __decorate([
    (0, common_1.Module)({
        imports: [
            password_module_1.PasswordModule,
            typeorm_1.TypeOrmModule.forFeature([users_orm_entity_1.UsersOrmEntity, user_company_orm_entity_1.UserCompanyOrmEntity]),
        ],
        controllers: [users_controller_1.UsersController],
        providers: [
            create_users_use_case_1.CreateUsersUseCase,
            list_users_use_case_1.ListUsersUseCase,
            get_users_use_case_1.GetUsersUseCase,
            update_users_use_case_1.UpdateUsersUseCase,
            login_get_users_use_case_1.FindUserByEmailUseCase,
            {
                provide: users_repository_1.UsersRepository,
                useClass: users_repository_impl_1.UsersRepositoryImpl,
            },
        ],
        exports: [
            login_get_users_use_case_1.FindUserByEmailUseCase,
            create_users_use_case_1.CreateUsersUseCase,
        ],
    })
], UsersModule);
//# sourceMappingURL=users.module.js.map