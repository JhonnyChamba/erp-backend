"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const storage_service_1 = require("./storage.service");
const storage_controller_1 = require("./storage.controller");
const company_orm_entity_1 = require("../company/infrastructure/persistence/company.orm-entity");
const branch_company_orm_entity_1 = require("../branch-company/infrastructure/persistence/branch-company.orm-entity");
const users_orm_entity_1 = require("../users/infrastructure/persistence/users.orm-entity");
let StorageModule = class StorageModule {
};
exports.StorageModule = StorageModule;
exports.StorageModule = StorageModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                company_orm_entity_1.CompanyOrmEntity,
                branch_company_orm_entity_1.BranchCompanyOrmEntity,
                users_orm_entity_1.UsersOrmEntity,
            ]),
        ],
        controllers: [storage_controller_1.StorageController],
        providers: [storage_service_1.StorageService],
        exports: [storage_service_1.StorageService],
    })
], StorageModule);
//# sourceMappingURL=storage.module.js.map