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
exports.UpdateTaxDto = exports.CreateTaxDto = void 0;
const class_validator_1 = require("class-validator");
class CreateTaxDto {
    code;
    percentage;
    description;
    status;
    is_default;
}
exports.CreateTaxDto = CreateTaxDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'El código del impuesto es obligatorio' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTaxDto.prototype, "code", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'El porcentaje es obligatorio' }),
    (0, class_validator_1.IsNumber)({}, { message: 'El porcentaje debe ser un valor numérico' }),
    __metadata("design:type", Number)
], CreateTaxDto.prototype, "percentage", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'La descripción es obligatoria' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTaxDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTaxDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateTaxDto.prototype, "is_default", void 0);
class UpdateTaxDto {
    code;
    percentage;
    description;
    status;
    is_default;
}
exports.UpdateTaxDto = UpdateTaxDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTaxDto.prototype, "code", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateTaxDto.prototype, "percentage", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTaxDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTaxDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateTaxDto.prototype, "is_default", void 0);
//# sourceMappingURL=tax.dto.js.map