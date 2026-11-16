"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TechnicalServiceModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const work_order_orm_entity_1 = require("./infrastructure/persistence/work-order.orm-entity");
const work_order_item_orm_entity_1 = require("./infrastructure/persistence/work-order-item.orm-entity");
const work_order_repository_1 = require("./domain/repositories/work-order.repository");
const work_order_repository_impl_1 = require("./infrastructure/repositories/work-order.repository.impl");
const create_work_order_use_case_1 = require("./application/use-cases/create-work-order.use-case");
const list_work_orders_use_case_1 = require("./application/use-cases/list-work-orders.use-case");
const get_work_order_use_case_1 = require("./application/use-cases/get-work-order.use-case");
const update_work_order_use_case_1 = require("./application/use-cases/update-work-order.use-case");
const update_work_order_status_use_case_1 = require("./application/use-cases/update-work-order-status.use-case");
const delete_work_order_use_case_1 = require("./application/use-cases/delete-work-order.use-case");
const work_order_controller_1 = require("./presentation/work-order.controller");
let TechnicalServiceModule = class TechnicalServiceModule {
};
exports.TechnicalServiceModule = TechnicalServiceModule;
exports.TechnicalServiceModule = TechnicalServiceModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                work_order_orm_entity_1.WorkOrderOrmEntity,
                work_order_item_orm_entity_1.WorkOrderItemOrmEntity,
            ]),
        ],
        controllers: [work_order_controller_1.WorkOrderController],
        providers: [
            {
                provide: work_order_repository_1.WorkOrderRepository,
                useClass: work_order_repository_impl_1.WorkOrderRepositoryImpl,
            },
            create_work_order_use_case_1.CreateWorkOrderUseCase,
            list_work_orders_use_case_1.ListWorkOrdersUseCase,
            get_work_order_use_case_1.GetWorkOrderUseCase,
            update_work_order_use_case_1.UpdateWorkOrderUseCase,
            update_work_order_status_use_case_1.UpdateWorkOrderStatusUseCase,
            delete_work_order_use_case_1.DeleteWorkOrderUseCase,
        ],
        exports: [work_order_repository_1.WorkOrderRepository, get_work_order_use_case_1.GetWorkOrderUseCase],
    })
], TechnicalServiceModule);
//# sourceMappingURL=technical-service.module.js.map