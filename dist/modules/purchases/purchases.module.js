"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurchasesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const purchase_orm_entity_1 = require("./infrastructure/persistence/purchase.orm-entity");
const purchases_service_1 = require("./application/purchases.service");
const purchases_controller_1 = require("./presentation/purchases.controller");
const company_orm_entity_1 = require("../company/infrastructure/persistence/company.orm-entity");
const inventory_orm_entity_1 = require("../inventory/infrastructure/persistence/inventory.orm-entity");
const inventory_module_1 = require("../inventory/inventory.module");
let PurchasesModule = class PurchasesModule {
};
exports.PurchasesModule = PurchasesModule;
exports.PurchasesModule = PurchasesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                purchase_orm_entity_1.PurchaseOrmEntity,
                purchase_orm_entity_1.PurchaseDetailOrmEntity,
                company_orm_entity_1.CompanyOrmEntity,
                inventory_orm_entity_1.InventoryWarehouseOrmEntity,
            ]),
            inventory_module_1.InventoryModule,
        ],
        controllers: [purchases_controller_1.PurchasesController],
        providers: [purchases_service_1.PurchasesService],
        exports: [purchases_service_1.PurchasesService],
    })
], PurchasesModule);
//# sourceMappingURL=purchases.module.js.map