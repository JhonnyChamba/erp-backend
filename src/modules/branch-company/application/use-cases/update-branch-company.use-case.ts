import { BranchCompanyRepository } from "../../domain/repositories/branch-company.repository";
import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { mapMatrixConflict } from './branch-matrix.util';

@Injectable()
export class UpdateBranchCompanyUseCase {
  constructor(private readonly repository: BranchCompanyRepository) {}

  async execute(id: number, companyId: number, dto: any) {
    const branch = await this.repository.findById(id, companyId);
    if (!branch) throw new NotFoundException('Sucursal no encontrada');

    if (dto.code !== undefined && dto.code.trim() !== branch.code) {
      const duplicated = await this.repository.findByCode(companyId, dto.code.trim());
      if (duplicated && duplicated.id !== branch.id) {
        throw new ConflictException(`Ya existe una sucursal con el establecimiento ${dto.code.trim()} en esta empresa.`);
      }
    }

    // Reglas de la matriz: siempre una sola, y no puede quedar la empresa sin matriz por quitar la marca o deshabilitarla
    if (dto.is_matrix === true && !branch.isMatrix) {
      const matrix = await this.repository.findMatrix(companyId);
      if (matrix) {
        throw new ConflictException(`La empresa ya tiene una sucursal matriz (${matrix.code} - ${matrix.name}). Para cambiarla usa la opción "Marcar como matriz" en esta sucursal.`);
      }
    }
    if (branch.isMatrix && dto.is_matrix === false) {
      throw new BadRequestException('La matriz no puede quedar sin marcar. Para cambiarla, marca otra sucursal como matriz.');
    }
    if (branch.isMatrix && dto.enabled === false) {
      throw new BadRequestException('La sucursal matriz no se puede deshabilitar. Marca otra sucursal como matriz primero.');
    }

    branch.code = dto.code !== undefined ? dto.code.trim() : branch.code;
    branch.name = dto.name !== undefined ? dto.name.trim() : branch.name;
    branch.address = dto.address !== undefined ? dto.address.trim() : branch.address;
    branch.emissionPoint = dto.emission_point ?? branch.emissionPoint;
    if (dto.phone !== undefined) branch.phone = dto.phone?.trim() || null;
    if (dto.email !== undefined) branch.email = dto.email?.trim() || null;
    branch.enabled = dto.enabled ?? branch.enabled;
    if (dto.is_matrix === true) branch.isMatrix = true;

    try {
      return await this.repository.update(branch);
    } catch (error) {
      mapMatrixConflict(error);
    }
  }
}
