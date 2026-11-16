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
exports.UpdateBranchCompanyUseCase = void 0;
const branch_company_repository_1 = require("../../domain/repositories/branch-company.repository");
const common_1 = require("@nestjs/common");
const branch_matrix_util_1 = require("./branch-matrix.util");
let UpdateBranchCompanyUseCase = class UpdateBranchCompanyUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(id, companyId, dto) {
        const branch = await this.repository.findById(id, companyId);
        if (!branch)
            throw new common_1.NotFoundException('Sucursal no encontrada');
        if (dto.code !== undefined && dto.code.trim() !== branch.code) {
            const duplicated = await this.repository.findByCode(companyId, dto.code.trim());
            if (duplicated && duplicated.id !== branch.id) {
                throw new common_1.ConflictException(`Ya existe una sucursal con el establecimiento ${dto.code.trim()} en esta empresa.`);
            }
        }
        if (dto.is_matrix === true && !branch.isMatrix) {
            const matrix = await this.repository.findMatrix(companyId);
            if (matrix) {
                throw new common_1.ConflictException(`La empresa ya tiene una sucursal matriz (${matrix.code} - ${matrix.name}). Para cambiarla usa la opción "Marcar como matriz" en esta sucursal.`);
            }
        }
        if (branch.isMatrix && dto.is_matrix === false) {
            throw new common_1.BadRequestException('La matriz no puede quedar sin marcar. Para cambiarla, marca otra sucursal como matriz.');
        }
        if (branch.isMatrix && dto.enabled === false) {
            throw new common_1.BadRequestException('La sucursal matriz no se puede deshabilitar. Marca otra sucursal como matriz primero.');
        }
        branch.code = dto.code !== undefined ? dto.code.trim() : branch.code;
        branch.name = dto.name !== undefined ? dto.name.trim() : branch.name;
        branch.address = dto.address !== undefined ? dto.address.trim() : branch.address;
        branch.emissionPoint = dto.emission_point ?? branch.emissionPoint;
        if (dto.phone !== undefined)
            branch.phone = dto.phone?.trim() || null;
        if (dto.email !== undefined)
            branch.email = dto.email?.trim() || null;
        branch.enabled = dto.enabled ?? branch.enabled;
        if (dto.is_matrix === true)
            branch.isMatrix = true;
        try {
            return await this.repository.update(branch);
        }
        catch (error) {
            (0, branch_matrix_util_1.mapMatrixConflict)(error);
        }
    }
};
exports.UpdateBranchCompanyUseCase = UpdateBranchCompanyUseCase;
exports.UpdateBranchCompanyUseCase = UpdateBranchCompanyUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [branch_company_repository_1.BranchCompanyRepository])
], UpdateBranchCompanyUseCase);
//# sourceMappingURL=update-branch-company.use-case.js.map