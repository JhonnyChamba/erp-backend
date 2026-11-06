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
exports.CreateCompanyUseCase = void 0;
const company_repository_1 = require("../../domain/repositories/company.repository");
const company_entity_1 = require("../../domain/entities/company.entity");
const common_1 = require("@nestjs/common");
let CreateCompanyUseCase = class CreateCompanyUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(dto, user) {
        const company = new company_entity_1.Company(null, dto.ruc, dto.description, dto.business_name, dto.trade_name, true, undefined, user.user_name, user.user_id);
        return this.repository.create(company);
    }
};
exports.CreateCompanyUseCase = CreateCompanyUseCase;
exports.CreateCompanyUseCase = CreateCompanyUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [company_repository_1.CompanyRepository])
], CreateCompanyUseCase);
//# sourceMappingURL=create-company.use-case.js.map