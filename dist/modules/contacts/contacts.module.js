"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const contacts_orm_entity_1 = require("./infrastructure/persistence/contacts.orm-entity");
const contacts_service_1 = require("./application/contacts.service");
const customers_controller_1 = require("./presentation/customers.controller");
const providers_controller_1 = require("./presentation/providers.controller");
const sellers_controller_1 = require("./presentation/sellers.controller");
let ContactsModule = class ContactsModule {
};
exports.ContactsModule = ContactsModule;
exports.ContactsModule = ContactsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([contacts_orm_entity_1.CustomerOrmEntity, contacts_orm_entity_1.ProviderOrmEntity, contacts_orm_entity_1.SellerOrmEntity])],
        controllers: [customers_controller_1.CustomersController, providers_controller_1.ProvidersController, sellers_controller_1.SellersController],
        providers: [contacts_service_1.ContactsService],
        exports: [contacts_service_1.ContactsService],
    })
], ContactsModule);
//# sourceMappingURL=contacts.module.js.map