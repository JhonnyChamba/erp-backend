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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InspectCertUseCase = exports.InspectCertDto = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const class_validator_1 = require("class-validator");
const company_orm_entity_1 = require("../../infrastructure/persistence/company.orm-entity");
const secret_crypto_1 = require("../../../../common/crypto/secret-crypto");
const cert_inspector_util_1 = require("../cert-inspector.util");
class InspectCertDto {
    cert_p12_base64;
    cert_password;
}
exports.InspectCertDto = InspectCertDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], InspectCertDto.prototype, "cert_p12_base64", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], InspectCertDto.prototype, "cert_password", void 0);
let InspectCertUseCase = class InspectCertUseCase {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async execute(companyId, dto) {
        let p12Base64 = dto.cert_p12_base64;
        let password = dto.cert_password;
        let company = null;
        if (companyId) {
            company = await this.repo
                .createQueryBuilder('c')
                .addSelect(['c.cert_p12_base64', 'c.cert_password_enc'])
                .where('c.id = :id AND c.deleted = false', { id: companyId })
                .getOne();
            if (!company) {
                throw new common_1.NotFoundException('Empresa no encontrada.');
            }
            if (!p12Base64 && company.cert_p12_base64) {
                p12Base64 = company.cert_p12_base64;
            }
            if (!password && company.cert_password_enc) {
                try {
                    password = (0, secret_crypto_1.decryptSecret)(company.cert_password_enc);
                }
                catch (e) {
                }
            }
        }
        if (!p12Base64) {
            throw new common_1.BadRequestException('No se ha proporcionado ni encontrado el archivo de firma (.p12).');
        }
        if (!password) {
            throw new common_1.BadRequestException('Debes ingresar la contraseña de la firma electrónica para inspeccionarla.');
        }
        try {
            const result = (0, cert_inspector_util_1.inspectP12)(p12Base64, password);
            if (company && result.expires_at && company.cert_expires_at !== result.expires_at) {
                await this.repo.update({ id: company.id }, { cert_expires_at: result.expires_at });
            }
            return result;
        }
        catch (err) {
            throw new common_1.BadRequestException(err?.message || 'Error al inspeccionar el certificado .p12');
        }
    }
};
exports.InspectCertUseCase = InspectCertUseCase;
exports.InspectCertUseCase = InspectCertUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(company_orm_entity_1.CompanyOrmEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], InspectCertUseCase);
//# sourceMappingURL=inspect-cert.use-case.js.map