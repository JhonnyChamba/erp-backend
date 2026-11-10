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
exports.SellerDto = exports.ProviderDto = exports.CustomerDto = exports.PAYMENT_TERMS = exports.DOCUMENT_TYPES = exports.CONTACT_STATES = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
exports.CONTACT_STATES = ['activo', 'inactivo'];
exports.DOCUMENT_TYPES = ['04', '05', '06', '07'];
exports.PAYMENT_TERMS = ['contado', 'credito_15', 'credito_30', 'credito_60', 'transferencia'];
class ContactBaseDto {
    tipo_documento;
    num_document;
    email;
    telefono;
    direccion;
    estado;
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(exports.DOCUMENT_TYPES, { message: 'tipo_documento debe ser 04 (RUC), 05 (Cédula), 06 (Pasaporte) o 07 (Consumidor final)' }),
    __metadata("design:type", String)
], ContactBaseDto.prototype, "tipo_documento", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(20),
    __metadata("design:type", String)
], ContactBaseDto.prototype, "num_document", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)((o) => o.email !== undefined && o.email !== null && o.email !== ''),
    (0, class_validator_1.IsEmail)({}, { message: 'email no es un correo válido' }),
    (0, class_validator_1.MaxLength)(150),
    __metadata("design:type", String)
], ContactBaseDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(30),
    __metadata("design:type", String)
], ContactBaseDto.prototype, "telefono", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(250),
    __metadata("design:type", String)
], ContactBaseDto.prototype, "direccion", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(exports.CONTACT_STATES, { message: "estado debe ser 'activo' o 'inactivo'" }),
    __metadata("design:type", String)
], ContactBaseDto.prototype, "estado", void 0);
class CustomerDto extends ContactBaseDto {
    razon_social;
    nombre_comercial;
    ciudad;
}
exports.CustomerDto = CustomerDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], CustomerDto.prototype, "razon_social", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], CustomerDto.prototype, "nombre_comercial", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CustomerDto.prototype, "ciudad", void 0);
class ProviderDto extends ContactBaseDto {
    razon_social;
    nombre_comercial;
    forma_pago;
    banco;
    num_cuenta;
}
exports.ProviderDto = ProviderDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], ProviderDto.prototype, "razon_social", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], ProviderDto.prototype, "nombre_comercial", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(exports.PAYMENT_TERMS, { message: 'forma_pago no es válida' }),
    __metadata("design:type", String)
], ProviderDto.prototype, "forma_pago", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], ProviderDto.prototype, "banco", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(40),
    __metadata("design:type", String)
], ProviderDto.prototype, "num_cuenta", void 0);
class SellerDto extends ContactBaseDto {
    nombres;
    apellidos;
    comision_pct;
}
exports.SellerDto = SellerDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", String)
], SellerDto.prototype, "nombres", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", String)
], SellerDto.prototype, "apellidos", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100, { message: 'comision_pct debe estar entre 0 y 100' }),
    __metadata("design:type", Number)
], SellerDto.prototype, "comision_pct", void 0);
//# sourceMappingURL=contacts.dto.js.map