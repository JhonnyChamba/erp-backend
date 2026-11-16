"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionsModuleModule = void 0;
const create_subscriptions_module_use_case_1 = require("./application/use-cases/create-subscriptions-module.use-case");
const update_subscriptions_module_use_case_1 = require("./application/use-cases/update-subscriptions-module.use-case");
const subscriptions_module_repository_impl_1 = require("./infrastructure/repositories/subscriptions-module.repository.impl");
const list_subscriptions_module_use_case_1 = require("./application/use-cases/list-subscriptions-module.use-case");
const subscriptions_module_orm_entity_1 = require("./infrastructure/persistence/subscriptions-module.orm-entity");
const get_subscriptions_module_use_case_1 = require("./application/use-cases/get-subscriptions-module.use-case");
const subscriptions_module_repository_1 = require("./domain/repositories/subscriptions-module.repository");
const subscriptions_module_controller_1 = require("./presentation/subscriptions-module.controller");
const typeorm_1 = require("@nestjs/typeorm");
const common_1 = require("@nestjs/common");
const module_module_1 = require("../module/module.module");
let SubscriptionsModuleModule = class SubscriptionsModuleModule {
};
exports.SubscriptionsModuleModule = SubscriptionsModuleModule;
exports.SubscriptionsModuleModule = SubscriptionsModuleModule = __decorate([
    (0, common_1.Module)({
        imports: [module_module_1.ModuleModule, typeorm_1.TypeOrmModule.forFeature([subscriptions_module_orm_entity_1.SubscriptionsModuleOrmEntity])],
        controllers: [subscriptions_module_controller_1.SubscriptionsModuleController],
        providers: [
            create_subscriptions_module_use_case_1.CreateSubscriptionsModuleUseCase,
            list_subscriptions_module_use_case_1.ListSubscriptionsModuleUseCase,
            get_subscriptions_module_use_case_1.GetSubscriptionsModuleUseCase,
            update_subscriptions_module_use_case_1.UpdateSubscriptionsModuleUseCase,
            {
                provide: subscriptions_module_repository_1.SubscriptionsModuleRepository,
                useClass: subscriptions_module_repository_impl_1.SubscriptionsModuleRepositoryImpl,
            },
        ],
    })
], SubscriptionsModuleModule);
//# sourceMappingURL=subscriptions-module.module.js.map