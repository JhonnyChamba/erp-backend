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
exports.CreateCreditNoteDto = exports.CreateCreditNoteDetailDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class CreateCreditNoteDetailDto {
    item_type;
    item_id;
    warehouse_id;
    code;
    description;
    quantity;
    unit_price;
    discount;
    tax_rate;
}
exports.CreateCreditNoteDetailDto = CreateCreditNoteDetailDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCreditNoteDetailDto.prototype, "item_type", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateCreditNoteDetailDto.prototype, "item_id", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateCreditNoteDetailDto.prototype, "warehouse_id", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCreditNoteDetailDto.prototype, "code", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'La descripción del ítem es obligatoria.' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCreditNoteDetailDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'La cantidad es obligatoria.' }),
    (0, class_validator_1.IsNumber)({}, { message: 'La cantidad debe ser numérica.' }),
    __metadata("design:type", Number)
], CreateCreditNoteDetailDto.prototype, "quantity", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'El precio unitario es obligatorio.' }),
    (0, class_validator_1.IsNumber)({}, { message: 'El precio debe ser numérico.' }),
    __metadata("design:type", Number)
], CreateCreditNoteDetailDto.prototype, "unit_price", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateCreditNoteDetailDto.prototype, "discount", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateCreditNoteDetailDto.prototype, "tax_rate", void 0);
class CreateCreditNoteDto {
    invoiceId;
    branchId;
    emission_point;
    issue_date;
    modified_document_type;
    modified_document_number;
    modified_document_date;
    reason;
    customer_id_type;
    customer_id_number;
    customer_name;
    customer_address;
    customer_email;
    customer_phone;
    adjust_inventory;
    notes;
    details;
}
exports.CreateCreditNoteDto = CreateCreditNoteDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateCreditNoteDto.prototype, "invoiceId", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'La sucursal es requerida.' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateCreditNoteDto.prototype, "branchId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCreditNoteDto.prototype, "emission_point", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCreditNoteDto.prototype, "issue_date", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCreditNoteDto.prototype, "modified_document_type", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'El número de comprobante modificado es obligatorio (ej. 001-001-000000001).' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCreditNoteDto.prototype, "modified_document_number", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCreditNoteDto.prototype, "modified_document_date", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'El motivo de emisión de la nota de crédito es obligatorio según el SRI.' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCreditNoteDto.prototype, "reason", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCreditNoteDto.prototype, "customer_id_type", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCreditNoteDto.prototype, "customer_id_number", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCreditNoteDto.prototype, "customer_name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCreditNoteDto.prototype, "customer_address", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCreditNoteDto.prototype, "customer_email", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCreditNoteDto.prototype, "customer_phone", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateCreditNoteDto.prototype, "adjust_inventory", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCreditNoteDto.prototype, "notes", void 0);
__decorate([
    (0, class_validator_1.IsArray)({ message: 'Los detalles deben ser una lista.' }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CreateCreditNoteDetailDto),
    __metadata("design:type", Array)
], CreateCreditNoteDto.prototype, "details", void 0);
//# sourceMappingURL=create-credit-note.dto.js.map