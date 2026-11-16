"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserCompanyModule = void 0;
const user_company_repository_impl_1 = require("./infrastructure/repositories/user-company.repository.impl");
const create_user_company_use_case_1 = require("./application/use-cases/create-user-company.use-case");
const update_user_company_use_case_1 = require("./application/use-cases/update-user-company.use-case");
const list_user_company_use_case_1 = require("./application/use-cases/list-user-company.use-case");
const user_company_orm_entity_1 = require("./infrastructure/persistence/user-company.orm-entity");
const company_orm_entity_1 = require("../company/infrastructure/persistence/company.orm-entity");
const get_user_company_use_case_1 = require("./application/use-cases/get-user-company.use-case");
const user_company_repository_1 = require("./domain/repositories/user-company.repository");
const typeorm_1 = require("@nestjs/typeorm");
const common_1 = require("@nestjs/common");
const user_company_controller_1 = require("./presentation/user-company.controller");
let UserCompanyModule = class UserCompanyModule {
};
exports.UserCompanyModule = UserCompanyModule;
exports.UserCompanyModule = UserCompanyModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([user_company_orm_entity_1.UserCompanyOrmEntity, company_orm_entity_1.CompanyOrmEntity]),
        ],
        controllers: [user_company_controller_1.UserCompanyController],
        providers: [
            create_user_company_use_case_1.CreateUserCompanyUseCase,
            list_user_company_use_case_1.ListUserCompanyUseCase,
            get_user_company_use_case_1.GetUserCompanyUseCase,
            update_user_company_use_case_1.UpdateUserCompanyUseCase,
            {
                provide: user_company_repository_1.UserCompanyRepository,
                useClass: user_company_repository_impl_1.UserCompanyRepositoryImpl,
            },
        ],
    })
], UserCompanyModule);
//# sourceMappingURL=user-company.module.js.map