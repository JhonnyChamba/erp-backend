"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolesTemplatesModule = void 0;
const roles_templates_repository_impl_1 = require("./infrastructure/repositories/roles-templates.repository.impl");
const create_roles_templates_use_case_1 = require("./application/use-cases/create-roles-templates.use-case");
const update_roles_templates_use_case_1 = require("./application/use-cases/update-roles-templates.use-case");
const list_roles_templates_use_case_1 = require("./application/use-cases/list-roles-templates.use-case");
const roles_templates_orm_entity_1 = require("./infrastructure/persistence/roles-templates.orm-entity");
const get_roles_templates_use_case_1 = require("./application/use-cases/get-roles-templates.use-case");
const roles_templates_repository_1 = require("./domain/repositories/roles-templates.repository");
const roles_templates_controller_1 = require("./presentation/roles-templates.controller");
const typeorm_1 = require("@nestjs/typeorm");
const common_1 = require("@nestjs/common");
let RolesTemplatesModule = class RolesTemplatesModule {
};
exports.RolesTemplatesModule = RolesTemplatesModule;
exports.RolesTemplatesModule = RolesTemplatesModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([roles_templates_orm_entity_1.RolesTemplatesOrmEntity])],
        controllers: [roles_templates_controller_1.RolesTemplatesController],
        providers: [
            create_roles_templates_use_case_1.CreateRolesTemplatesUseCase,
            list_roles_templates_use_case_1.ListRolesTemplatesUseCase,
            get_roles_templates_use_case_1.GetRolesTemplatesUseCase,
            update_roles_templates_use_case_1.UpdateRolesTemplatesUseCase,
            {
                provide: roles_templates_repository_1.RolesTemplatesRepository,
                useClass: roles_templates_repository_impl_1.RolesTemplatesRepositoryImpl,
            },
        ],
    })
], RolesTemplatesModule);
//# sourceMappingURL=roles-templates.module.js.map