"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModuleModule = void 0;
const module_repository_impl_1 = require("./infrastructure/repositories/module.repository.impl");
const create_module_use_case_1 = require("./application/use-cases/create-module.use-case");
const update_module_use_case_1 = require("./application/use-cases/update-module.use-case");
const list_module_use_case_1 = require("./application/use-cases/list-module.use-case");
const module_orm_entity_1 = require("./infrastructure/persistence/module.orm-entity");
const get_module_use_case_1 = require("./application/use-cases/get-module.use-case");
const module_repository_1 = require("./domain/repositories/module.repository");
const module_controller_1 = require("./presentation/module.controller");
const typeorm_1 = require("@nestjs/typeorm");
const common_1 = require("@nestjs/common");
let ModuleModule = class ModuleModule {
};
exports.ModuleModule = ModuleModule;
exports.ModuleModule = ModuleModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([module_orm_entity_1.ModuleOrmEntity])],
        controllers: [module_controller_1.ModuleController],
        providers: [
            create_module_use_case_1.CreateModuleUseCase,
            list_module_use_case_1.ListModuleUseCase,
            get_module_use_case_1.GetModuleUseCase,
            update_module_use_case_1.UpdateModuleUseCase,
            {
                provide: module_repository_1.ModuleRepository,
                useClass: module_repository_impl_1.ModuleRepositoryImpl,
            },
        ],
        exports: [
            module_repository_1.ModuleRepository,
            create_module_use_case_1.CreateModuleUseCase,
            list_module_use_case_1.ListModuleUseCase,
            get_module_use_case_1.GetModuleUseCase,
        ],
    })
], ModuleModule);
//# sourceMappingURL=module.module.js.map