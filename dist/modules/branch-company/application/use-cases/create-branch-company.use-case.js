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
exports.CreateBranchCompanyUseCase = void 0;
const branch_company_repository_1 = require("../../domain/repositories/branch-company.repository");
const branch_company_entity_1 = require("../../domain/entities/branch-company.entity");
const common_1 = require("@nestjs/common");
const branch_matrix_util_1 = require("./branch-matrix.util");
let CreateBranchCompanyUseCase = class CreateBranchCompanyUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(dto, user) {
        const code = dto.code.trim();
        if (await this.repository.findByCode(dto.companyId, code)) {
            throw new common_1.ConflictException(`Ya existe una sucursal con el establecimiento ${code} en esta empresa.`);
        }
        const isFirst = (await this.repository.countByCompany(dto.companyId)) === 0;
        const isMatrix = isFirst ? true : Boolean(dto.is_matrix);
        if (isMatrix && !isFirst) {
            const matrix = await this.repository.findMatrix(dto.companyId);
            if (matrix) {
                throw new common_1.ConflictException(`La empresa ya tiene una sucursal matriz (${matrix.code} - ${matrix.name}). Para cambiarla usa la opción "Marcar como matriz" en la sucursal que será la nueva matriz.`);
            }
        }
        const branch = new branch_company_entity_1.BranchCompany(null, code, dto.name.trim(), dto.address.trim(), dto.companyId, true, undefined, user.user_id, dto.emission_point || '001', dto.phone?.trim() || null, dto.email?.trim() || null, isMatrix);
        try {
            return await this.repository.create(branch);
        }
        catch (error) {
            (0, branch_matrix_util_1.mapMatrixConflict)(error);
        }
    }
};
exports.CreateBranchCompanyUseCase = CreateBranchCompanyUseCase;
exports.CreateBranchCompanyUseCase = CreateBranchCompanyUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [branch_company_repository_1.BranchCompanyRepository])
], CreateBranchCompanyUseCase);
//# sourceMappingURL=create-branch-company.use-case.js.map