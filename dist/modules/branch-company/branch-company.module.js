"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BranchCompanyModule = void 0;
const branch_repository_impl_1 = require("./infrastructure/repositories/branch.repository.impl");
const create_branch_company_use_case_1 = require("./application/use-cases/create-branch-company.use-case");
const update_branch_company_use_case_1 = require("./application/use-cases/update-branch-company.use-case");
const list_branch_company_use_case_1 = require("./application/use-cases/list-branch-company.use-case");
const branch_company_orm_entity_1 = require("./infrastructure/persistence/branch-company.orm-entity");
const get_branch_company_use_case_1 = require("./application/use-cases/get-branch-company.use-case");
const branch_company_repository_1 = require("./domain/repositories/branch-company.repository");
const branch_company_controller_1 = require("./presentation/branch-company.controller");
const typeorm_1 = require("@nestjs/typeorm");
const common_1 = require("@nestjs/common");
let BranchCompanyModule = class BranchCompanyModule {
};
exports.BranchCompanyModule = BranchCompanyModule;
exports.BranchCompanyModule = BranchCompanyModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([branch_company_orm_entity_1.BranchCompanyOrmEntity])],
        controllers: [branch_company_controller_1.BranchCompanyController],
        providers: [
            create_branch_company_use_case_1.CreateBranchCompanyUseCase,
            list_branch_company_use_case_1.ListBranchCompanyUseCase,
            get_branch_company_use_case_1.GetBranchCompanyUseCase,
            update_branch_company_use_case_1.UpdateBranchCompanyUseCase,
            {
                provide: branch_company_repository_1.BranchCompanyRepository,
                useClass: branch_repository_impl_1.BranchCompanyRepositoryImpl,
            },
        ],
    })
], BranchCompanyModule);
//# sourceMappingURL=branch-company.module.js.map