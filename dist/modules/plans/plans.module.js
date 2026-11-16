"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlansModule = void 0;
const plans_repository_impl_1 = require("./infrastructure/repositories/plans.repository.impl");
const create_plans_use_case_1 = require("./application/use-cases/create-plans.use-case");
const update_plans_use_case_1 = require("./application/use-cases/update-plans.use-case");
const list_plans_use_case_1 = require("./application/use-cases/list-plans.use-case");
const plans_orm_entity_1 = require("./infrastructure/persistence/plans.orm-entity");
const get_plans_use_case_1 = require("./application/use-cases/get-plans.use-case");
const plans_repository_1 = require("./domain/repositories/plans.repository");
const plans_controller_1 = require("./presentation/plans.controller");
const typeorm_1 = require("@nestjs/typeorm");
const common_1 = require("@nestjs/common");
let PlansModule = class PlansModule {
};
exports.PlansModule = PlansModule;
exports.PlansModule = PlansModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([plans_orm_entity_1.PlansOrmEntity])],
        controllers: [plans_controller_1.PlansController],
        providers: [
            create_plans_use_case_1.CreatePlansUseCase,
            list_plans_use_case_1.ListPlansUseCase,
            get_plans_use_case_1.GetPlansUseCase,
            update_plans_use_case_1.UpdatePlansUseCase,
            {
                provide: plans_repository_1.PlansRepository,
                useClass: plans_repository_impl_1.PlansRepositoryImpl,
            },
        ],
    })
], PlansModule);
//# sourceMappingURL=plans.module.js.map