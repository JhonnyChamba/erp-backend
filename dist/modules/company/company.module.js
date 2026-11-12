"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyModule = void 0;
const company_repository_impl_1 = require("./infrastructure/repositories/company.repository.impl");
const create_company_use_case_1 = require("./application/use-cases/create-company.use-case");
const update_company_use_case_1 = require("./application/use-cases/update-company.use-case");
const list_company_use_case_1 = require("./application/use-cases/list-company.use-case");
const company_orm_entity_1 = require("./infrastructure/persistence/company.orm-entity");
const roles_orm_entity_1 = require("../roles/infrastructure/persistence/roles.orm-entity");
const subscriptions_orm_entity_1 = require("../subscriptions/infrastructure/persistence/subscriptions.orm-entity");
const contacts_orm_entity_1 = require("../contacts/infrastructure/persistence/contacts.orm-entity");
const inventory_orm_entity_1 = require("../inventory/infrastructure/persistence/inventory.orm-entity");
const branch_company_orm_entity_1 = require("../branch-company/infrastructure/persistence/branch-company.orm-entity");
const emission_point_orm_entity_1 = require("../sales/infrastructure/persistence/emission-point.orm-entity");
const tax_orm_entity_1 = require("../configuration/infrastructure/persistence/tax.orm-entity");
const document_type_orm_entity_1 = require("../configuration/infrastructure/persistence/document-type.orm-entity");
const user_company_orm_entity_1 = require("../user-company/infrastructure/persistence/user-company.orm-entity");
const get_company_use_case_1 = require("./application/use-cases/get-company.use-case");
const inspect_cert_use_case_1 = require("./application/use-cases/inspect-cert.use-case");
const company_repository_1 = require("./domain/repositories/company.repository");
const company_controller_1 = require("./presentation/company.controller");
const typeorm_1 = require("@nestjs/typeorm");
const common_1 = require("@nestjs/common");
let CompanyModule = class CompanyModule {
};
exports.CompanyModule = CompanyModule;
exports.CompanyModule = CompanyModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                company_orm_entity_1.CompanyOrmEntity,
                roles_orm_entity_1.RolesOrmEntity,
                roles_orm_entity_1.RoleModuleOrmEntity,
                subscriptions_orm_entity_1.SubscriptionsOrmEntity,
                contacts_orm_entity_1.CustomerOrmEntity,
                contacts_orm_entity_1.SellerOrmEntity,
                inventory_orm_entity_1.InventoryWarehouseOrmEntity,
                branch_company_orm_entity_1.BranchCompanyOrmEntity,
                emission_point_orm_entity_1.EmissionPointOrmEntity,
                emission_point_orm_entity_1.EmissionPointSequenceOrmEntity,
                tax_orm_entity_1.TaxOrmEntity,
                document_type_orm_entity_1.DocumentTypeOrmEntity,
                user_company_orm_entity_1.UserCompanyOrmEntity,
            ]),
        ],
        controllers: [company_controller_1.CompanyController],
        providers: [
            create_company_use_case_1.CreateCompanyUseCase,
            list_company_use_case_1.ListCompanyUseCase,
            get_company_use_case_1.GetCompanyUseCase,
            update_company_use_case_1.UpdateCompanyUseCase,
            inspect_cert_use_case_1.InspectCertUseCase,
            {
                provide: company_repository_1.CompanyRepository,
                useClass: company_repository_impl_1.CompanyRepositoryImpl,
            },
        ],
    })
], CompanyModule);
//# sourceMappingURL=company.module.js.map