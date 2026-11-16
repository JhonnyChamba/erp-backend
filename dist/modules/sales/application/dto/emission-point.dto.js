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
exports.UpdateSequenceDto = exports.UpdateEmissionPointDto = exports.CreateEmissionPointDto = void 0;
const class_validator_1 = require("class-validator");
class CreateEmissionPointDto {
    companyId;
    company_id;
    description;
    branch_id;
    serie;
    initial_correlative;
}
exports.CreateEmissionPointDto = CreateEmissionPointDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: 'El ID de la empresa debe ser numérico' }),
    __metadata("design:type", Number)
], CreateEmissionPointDto.prototype, "companyId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: 'El ID de la empresa debe ser numérico' }),
    __metadata("design:type", Number)
], CreateEmissionPointDto.prototype, "company_id", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'La descripción del punto de emisión es obligatoria' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEmissionPointDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Debe seleccionar la sucursal' }),
    (0, class_validator_1.IsNumber)({}, { message: 'El ID de la sucursal debe ser numérico' }),
    __metadata("design:type", Number)
], CreateEmissionPointDto.prototype, "branch_id", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'La serie es obligatoria (ej: 001, 856)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 10, { message: 'La serie debe tener entre 1 y 10 caracteres' }),
    __metadata("design:type", String)
], CreateEmissionPointDto.prototype, "serie", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: 'El correlativo inicial debe ser numérico' }),
    (0, class_validator_1.Min)(0, { message: 'El correlativo inicial no puede ser negativo' }),
    __metadata("design:type", Number)
], CreateEmissionPointDto.prototype, "initial_correlative", void 0);
class UpdateEmissionPointDto {
    companyId;
    company_id;
    description;
    branch_id;
    serie;
    enabled;
}
exports.UpdateEmissionPointDto = UpdateEmissionPointDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateEmissionPointDto.prototype, "companyId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateEmissionPointDto.prototype, "company_id", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateEmissionPointDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateEmissionPointDto.prototype, "branch_id", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateEmissionPointDto.prototype, "serie", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateEmissionPointDto.prototype, "enabled", void 0);
class UpdateSequenceDto {
    companyId;
    correlative;
}
exports.UpdateSequenceDto = UpdateSequenceDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateSequenceDto.prototype, "companyId", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'El correlativo es obligatorio' }),
    (0, class_validator_1.IsNumber)({}, { message: 'El correlativo debe ser numérico' }),
    (0, class_validator_1.Min)(0, { message: 'El correlativo no puede ser negativo' }),
    __metadata("design:type", Number)
], UpdateSequenceDto.prototype, "correlative", void 0);
//# sourceMappingURL=emission-point.dto.js.map