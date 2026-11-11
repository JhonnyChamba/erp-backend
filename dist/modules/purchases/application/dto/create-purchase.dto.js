"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatePurchaseDto = exports.CreatePurchaseDetailDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class CreatePurchaseDetailDto {
    item_type;
    item_id;
    itemId;
    code;
    description;
    unit;
    quantity;
    unit_cost;
    unitCost;
    tax_rate;
    taxRate;
}
exports.CreatePurchaseDetailDto = CreatePurchaseDetailDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePurchaseDetailDto.prototype, "item_type", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePurchaseDetailDto.prototype, "item_id", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePurchaseDetailDto.prototype, "itemId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePurchaseDetailDto.prototype, "code", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'La descripción del ítem es obligatoria' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePurchaseDetailDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePurchaseDetailDto.prototype, "unit", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'La cantidad es obligatoria' }),
    (0, class_validator_1.IsNumber)({}, { message: 'La cantidad debe ser numérica' }),
    (0, class_validator_1.Min)(0.0001, { message: 'La cantidad debe ser mayor a 0' }),
    __metadata("design:type", Number)
], CreatePurchaseDetailDto.prototype, "quantity", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'El costo unitario es obligatorio' }),
    (0, class_validator_1.IsNumber)({}, { message: 'El costo unitario debe ser numérico' }),
    (0, class_validator_1.Min)(0, { message: 'El costo unitario no puede ser negativo' }),
    __metadata("design:type", Number)
], CreatePurchaseDetailDto.prototype, "unit_cost", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePurchaseDetailDto.prototype, "unitCost", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePurchaseDetailDto.prototype, "tax_rate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePurchaseDetailDto.prototype, "taxRate", void 0);
class CreatePurchaseDto {
    companyId;
    company_id;
    provider_id;
    providerId;
    provider_name;
    providerName;
    provider_id_type;
    provider_id_number;
    providerIdNumber;
    provider_email;
    provider_phone;
    provider_address;
    establishment;
    emission_point;
    sequential;
    invoice_number;
    authorization_number;
    issue_date;
    warehouse_id;
    warehouseId;
    branch_id;
    payment_method;
    notes;
    items;
}
exports.CreatePurchaseDto = CreatePurchaseDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePurchaseDto.prototype, "companyId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePurchaseDto.prototype, "company_id", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePurchaseDto.prototype, "provider_id", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePurchaseDto.prototype, "providerId", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'El nombre o razón social del proveedor es obligatorio' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePurchaseDto.prototype, "provider_name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePurchaseDto.prototype, "providerName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePurchaseDto.prototype, "provider_id_type", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'El número de identificación del proveedor es obligatorio' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePurchaseDto.prototype, "provider_id_number", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePurchaseDto.prototype, "providerIdNumber", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePurchaseDto.prototype, "provider_email", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePurchaseDto.prototype, "provider_phone", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePurchaseDto.prototype, "provider_address", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'El establecimiento es obligatorio (ej. 001)' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePurchaseDto.prototype, "establishment", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'El punto de emisión es obligatorio (ej. 001)' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePurchaseDto.prototype, "emission_point", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'El secuencial de la factura es obligatorio' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePurchaseDto.prototype, "sequential", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePurchaseDto.prototype, "invoice_number", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePurchaseDto.prototype, "authorization_number", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'La fecha de emisión es obligatoria' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePurchaseDto.prototype, "issue_date", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'La bodega de recepción es obligatoria' }),
    (0, class_validator_1.IsNumber)({}, { message: 'El ID de la bodega debe ser numérico' }),
    __metadata("design:type", Number)
], CreatePurchaseDto.prototype, "warehouse_id", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePurchaseDto.prototype, "warehouseId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePurchaseDto.prototype, "branch_id", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePurchaseDto.prototype, "payment_method", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePurchaseDto.prototype, "notes", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CreatePurchaseDetailDto),
    __metadata("design:type", Array)
], CreatePurchaseDto.prototype, "items", void 0);
//# sourceMappingURL=create-purchase.dto.js.map