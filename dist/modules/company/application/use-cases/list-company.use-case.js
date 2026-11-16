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
exports.ListCompanyUseCase = void 0;
const company_repository_1 = require("../../domain/repositories/company.repository");
const access_control_service_1 = require("../../../../auth/access-control.service");
const common_1 = require("@nestjs/common");
let ListCompanyUseCase = class ListCompanyUseCase {
    repository;
    accessControlService;
    constructor(repository, accessControlService) {
        this.repository = repository;
        this.accessControlService = accessControlService;
    }
    async execute(dto, user) {
        const companyIds = await this.accessControlService.getAccessibleCompanyIds(user);
        const result = await this.repository.findByCompany(dto.page, dto.limit, companyIds);
        return {
            data: result.data,
            meta: {
                total: result.total,
                page: dto.page,
                limit: dto.limit,
                totalPages: Math.ceil(result.total / dto.limit),
            },
        };
    }
};
exports.ListCompanyUseCase = ListCompanyUseCase;
exports.ListCompanyUseCase = ListCompanyUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [company_repository_1.CompanyRepository,
        access_control_service_1.AccessControlService])
], ListCompanyUseCase);
//# sourceMappingURL=list-company.use-case.js.map