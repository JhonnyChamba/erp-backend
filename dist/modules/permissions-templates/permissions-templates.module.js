"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionsTemplatesModule = void 0;
const permissions_templates_repository_impl_1 = require("./infrastructure/repositories/permissions-templates.repository.impl");
const create_permissions_templates_use_case_1 = require("./application/use-cases/create-permissions-templates.use-case");
const update_permissions_templates_use_case_1 = require("./application/use-cases/update-permissions-templates.use-case");
const list_permissions_templates_use_case_1 = require("./application/use-cases/list-permissions-templates.use-case");
const permissions_templates_orm_entity_1 = require("./infrastructure/persistence/permissions-templates.orm-entity");
const get_permissions_templates_use_case_1 = require("./application/use-cases/get-permissions-templates.use-case");
const permissions_templates_repository_1 = require("./domain/repositories/permissions-templates.repository");
const permissions_templates_controller_1 = require("./presentation/permissions-templates.controller");
const typeorm_1 = require("@nestjs/typeorm");
const common_1 = require("@nestjs/common");
let PermissionsTemplatesModule = class PermissionsTemplatesModule {
};
exports.PermissionsTemplatesModule = PermissionsTemplatesModule;
exports.PermissionsTemplatesModule = PermissionsTemplatesModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([permissions_templates_orm_entity_1.PermissionsTemplatesOrmEntity])],
        controllers: [permissions_templates_controller_1.PermissionsTemplatesController],
        providers: [
            create_permissions_templates_use_case_1.CreatePermissionsTemplatesUseCase,
            list_permissions_templates_use_case_1.ListPermissionsTemplatesUseCase,
            get_permissions_templates_use_case_1.GetPermissionsTemplatesUseCase,
            update_permissions_templates_use_case_1.UpdatePermissionsTemplatesUseCase,
            {
                provide: permissions_templates_repository_1.PermissionsTemplatesRepository,
                useClass: permissions_templates_repository_impl_1.PermissionsTemplatesRepositoryImpl,
            },
        ],
    })
], PermissionsTemplatesModule);
//# sourceMappingURL=permissions-templates.module.js.map