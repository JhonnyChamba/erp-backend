"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const invoice_orm_entity_1 = require("./infrastructure/persistence/invoice.orm-entity");
const invoice_service_1 = require("./application/invoice.service");
const invoice_controller_1 = require("./presentation/invoice.controller");
const inventory_orm_entity_1 = require("../inventory/infrastructure/persistence/inventory.orm-entity");
const company_orm_entity_1 = require("../company/infrastructure/persistence/company.orm-entity");
let SalesModule = class SalesModule {
};
exports.SalesModule = SalesModule;
exports.SalesModule = SalesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                invoice_orm_entity_1.InvoiceOrmEntity,
                invoice_orm_entity_1.InvoiceDetailOrmEntity,
                inventory_orm_entity_1.InventoryItemOrmEntity,
                company_orm_entity_1.CompanyOrmEntity,
            ]),
        ],
        controllers: [invoice_controller_1.InvoiceController],
        providers: [invoice_service_1.InvoiceService],
        exports: [invoice_service_1.InvoiceService],
    })
], SalesModule);
//# sourceMappingURL=sales.module.js.map