"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlansModulesModule = void 0;
const create_plans_module_use_case_1 = require("./application/use-cases/create-plans-module.use-case");
const update_plans_module_use_case_1 = require("./application/use-cases/update-plans-module.use-case");
const plans_module_repository_impl_1 = require("./infrastructure/repositories/plans-module.repository.impl");
const list_plans_module_use_case_1 = require("./application/use-cases/list-plans-module.use-case");
const plans_module_orm_entity_1 = require("./infrastructure/persistence/plans-module.orm-entity");
const get_plans_module_use_case_1 = require("./application/use-cases/get-plans-module.use-case");
const plans_module_repository_1 = require("./domain/repositories/plans-module.repository");
const plans_module_controller_1 = require("./presentation/plans-module.controller");
const typeorm_1 = require("@nestjs/typeorm");
const common_1 = require("@nestjs/common");
const module_module_1 = require("../module/module.module");
let PlansModulesModule = class PlansModulesModule {
};
exports.PlansModulesModule = PlansModulesModule;
exports.PlansModulesModule = PlansModulesModule = __decorate([
    (0, common_1.Module)({
        imports: [module_module_1.ModuleModule, typeorm_1.TypeOrmModule.forFeature([plans_module_orm_entity_1.PlansModulesOrmEntity])],
        controllers: [plans_module_controller_1.PlansModulesController],
        providers: [
            create_plans_module_use_case_1.CreatePlansModulesUseCase,
            list_plans_module_use_case_1.ListPlansModulesUseCase,
            get_plans_module_use_case_1.GetPlansModulesUseCase,
            update_plans_module_use_case_1.UpdatePlansModulesUseCase,
            {
                provide: plans_module_repository_1.PlansModulesRepository,
                useClass: plans_module_repository_impl_1.PlansModulesRepositoryImpl,
            },
        ],
    })
], PlansModulesModule);
//# sourceMappingURL=plans-module.module.js.map