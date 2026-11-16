"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.subModulesModule = void 0;
const create_sub_module_use_case_1 = require("./application/use-cases/create-sub-module.use-case");
const update_sub_module_use_case_1 = require("./application/use-cases/update-sub-module.use-case");
const sub_module_repository_impl_1 = require("./infrastructure/repositories/sub-module.repository.impl");
const list_sub_module_use_case_1 = require("./application/use-cases/list-sub-module.use-case");
const sub_module_orm_entity_1 = require("./infrastructure/persistence/sub-module.orm-entity");
const get_sub_module_use_case_1 = require("./application/use-cases/get-sub-module.use-case");
const sub_module_repository_1 = require("./domain/repositories/sub-module.repository");
const sub_module_controller_1 = require("./presentation/sub-module.controller");
const typeorm_1 = require("@nestjs/typeorm");
const common_1 = require("@nestjs/common");
const module_module_1 = require("../module/module.module");
let subModulesModule = class subModulesModule {
};
exports.subModulesModule = subModulesModule;
exports.subModulesModule = subModulesModule = __decorate([
    (0, common_1.Module)({
        imports: [module_module_1.ModuleModule, typeorm_1.TypeOrmModule.forFeature([sub_module_orm_entity_1.subModulesOrmEntity])],
        controllers: [sub_module_controller_1.subModulesController],
        providers: [
            create_sub_module_use_case_1.CreatesubModulesUseCase,
            list_sub_module_use_case_1.ListsubModulesUseCase,
            get_sub_module_use_case_1.GetsubModulesUseCase,
            update_sub_module_use_case_1.UpdatesubModulesUseCase,
            {
                provide: sub_module_repository_1.subModulesRepository,
                useClass: sub_module_repository_impl_1.subModulesRepositoryImpl,
            },
        ],
    })
], subModulesModule);
//# sourceMappingURL=sub-module.module.js.map