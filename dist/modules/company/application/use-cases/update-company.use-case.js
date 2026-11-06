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
exports.UpdateCompanyUseCase = void 0;
const company_repository_1 = require("../../domain/repositories/company.repository");
const common_1 = require("@nestjs/common");
let UpdateCompanyUseCase = class UpdateCompanyUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(id, dto) {
        const company = await this.repository.findById(id);
        if (!company)
            throw new Error('Company not found');
        company.ruc = dto.ruc ?? company.ruc;
        company.description = dto.description ?? company.description;
        company.business_name = dto.business_name ?? company.business_name;
        company.trade_name = dto.trade_name ?? company.trade_name;
        company.enabled = dto.enabled ?? company.enabled;
        return this.repository.update(company);
    }
};
exports.UpdateCompanyUseCase = UpdateCompanyUseCase;
exports.UpdateCompanyUseCase = UpdateCompanyUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [company_repository_1.CompanyRepository])
], UpdateCompanyUseCase);
//# sourceMappingURL=update-company.use-case.js.map