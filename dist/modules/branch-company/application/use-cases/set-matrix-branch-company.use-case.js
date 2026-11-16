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
exports.SetMatrixBranchCompanyUseCase = void 0;
const branch_company_repository_1 = require("../../domain/repositories/branch-company.repository");
const common_1 = require("@nestjs/common");
const branch_matrix_util_1 = require("./branch-matrix.util");
let SetMatrixBranchCompanyUseCase = class SetMatrixBranchCompanyUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(id, companyId) {
        const branch = await this.repository.findById(id, companyId);
        if (!branch)
            throw new common_1.NotFoundException('Sucursal no encontrada');
        if (branch.isMatrix)
            return branch;
        if (!branch.enabled)
            throw new common_1.BadRequestException('Una sucursal deshabilitada no puede ser la matriz. Habilítala primero.');
        try {
            await this.repository.setMatrix(companyId, id);
        }
        catch (error) {
            (0, branch_matrix_util_1.mapMatrixConflict)(error);
        }
        return this.repository.findById(id, companyId);
    }
};
exports.SetMatrixBranchCompanyUseCase = SetMatrixBranchCompanyUseCase;
exports.SetMatrixBranchCompanyUseCase = SetMatrixBranchCompanyUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [branch_company_repository_1.BranchCompanyRepository])
], SetMatrixBranchCompanyUseCase);
//# sourceMappingURL=set-matrix-branch-company.use-case.js.map