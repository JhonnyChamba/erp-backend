"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionsModule = void 0;
const subscriptions_repository_impl_1 = require("./infrastructure/repositories/subscriptions.repository.impl");
const create_subscriptions_use_case_1 = require("./application/use-cases/create-subscriptions.use-case");
const update_subscriptions_use_case_1 = require("./application/use-cases/update-subscriptions.use-case");
const list_subscriptions_use_case_1 = require("./application/use-cases/list-subscriptions.use-case");
const subscriptions_orm_entity_1 = require("./infrastructure/persistence/subscriptions.orm-entity");
const get_subscriptions_use_case_1 = require("./application/use-cases/get-subscriptions.use-case");
const subscriptions_repository_1 = require("./domain/repositories/subscriptions.repository");
const subscriptions_controller_1 = require("./presentation/subscriptions.controller");
const typeorm_1 = require("@nestjs/typeorm");
const common_1 = require("@nestjs/common");
let SubscriptionsModule = class SubscriptionsModule {
};
exports.SubscriptionsModule = SubscriptionsModule;
exports.SubscriptionsModule = SubscriptionsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([subscriptions_orm_entity_1.SubscriptionsOrmEntity])],
        controllers: [subscriptions_controller_1.SubscriptionsController],
        providers: [
            create_subscriptions_use_case_1.CreateSubscriptionsUseCase,
            list_subscriptions_use_case_1.ListSubscriptionsUseCase,
            get_subscriptions_use_case_1.GetSubscriptionsUseCase,
            update_subscriptions_use_case_1.UpdateSubscriptionsUseCase,
            {
                provide: subscriptions_repository_1.SubscriptionsRepository,
                useClass: subscriptions_repository_impl_1.SubscriptionsRepositoryImpl,
            },
        ],
    })
], SubscriptionsModule);
//# sourceMappingURL=subscriptions.module.js.map