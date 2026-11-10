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
exports.ListBranchCompanyUseCase = void 0;
const branch_company_repository_1 = require("../../domain/repositories/branch-company.repository");
const common_1 = require("@nestjs/common");
let ListBranchCompanyUseCase = class ListBranchCompanyUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(dto, user) {
        const result = await this.repository.findByCompany(dto.companyId, dto.page, dto.limit, Boolean(dto.onlyEnabled));
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
exports.ListBranchCompanyUseCase = ListBranchCompanyUseCase;
exports.ListBranchCompanyUseCase = ListBranchCompanyUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [branch_company_repository_1.BranchCompanyRepository])
], ListBranchCompanyUseCase);
//# sourceMappingURL=list-branch-company.use-case.js.map