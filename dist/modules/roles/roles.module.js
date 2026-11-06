"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolesModule = void 0;
const roles_repository_impl_1 = require("./infrastructure/repositories/roles.repository.impl");
const create_roles_use_case_1 = require("./application/use-cases/create-roles.use-case");
const update_roles_use_case_1 = require("./application/use-cases/update-roles.use-case");
const list_roles_use_case_1 = require("./application/use-cases/list-roles.use-case");
const roles_orm_entity_1 = require("./infrastructure/persistence/roles.orm-entity");
const get_roles_use_case_1 = require("./application/use-cases/get-roles.use-case");
const roles_repository_1 = require("./domain/repositories/roles.repository");
const roles_controller_1 = require("./presentation/roles.controller");
const typeorm_1 = require("@nestjs/typeorm");
const common_1 = require("@nestjs/common");
let RolesModule = class RolesModule {
};
exports.RolesModule = RolesModule;
exports.RolesModule = RolesModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([roles_orm_entity_1.RolesOrmEntity, roles_orm_entity_1.RoleModuleOrmEntity])],
        controllers: [roles_controller_1.RolesController],
        providers: [
            create_roles_use_case_1.CreateRolesUseCase,
            list_roles_use_case_1.ListRolesUseCase,
            get_roles_use_case_1.GetRolesUseCase,
            update_roles_use_case_1.UpdateRolesUseCase,
            {
                provide: roles_repository_1.RolesRepository,
                useClass: roles_repository_impl_1.RolesRepositoryImpl,
            },
        ],
    })
], RolesModule);
//# sourceMappingURL=roles.module.js.map