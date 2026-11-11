"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigurationModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const tax_orm_entity_1 = require("./infrastructure/persistence/tax.orm-entity");
const document_type_orm_entity_1 = require("./infrastructure/persistence/document-type.orm-entity");
const tax_service_1 = require("./application/tax.service");
const document_type_service_1 = require("./application/document-type.service");
const tax_controller_1 = require("./presentation/tax.controller");
const document_type_controller_1 = require("./presentation/document-type.controller");
let ConfigurationModule = class ConfigurationModule {
};
exports.ConfigurationModule = ConfigurationModule;
exports.ConfigurationModule = ConfigurationModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([tax_orm_entity_1.TaxOrmEntity, document_type_orm_entity_1.DocumentTypeOrmEntity]),
        ],
        controllers: [tax_controller_1.TaxController, document_type_controller_1.DocumentTypeController],
        providers: [tax_service_1.TaxService, document_type_service_1.DocumentTypeService],
        exports: [tax_service_1.TaxService, document_type_service_1.DocumentTypeService],
    })
], ConfigurationModule);
//# sourceMappingURL=configuration.module.js.map