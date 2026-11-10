import { BranchCompanyRepository } from "../../domain/repositories/branch-company.repository";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { mapMatrixConflict } from './branch-matrix.util';

/** Cambia la sucursal matriz de la empresa: la anterior deja de serlo en la misma transacción. */
@Injectable()
export class SetMatrixBranchCompanyUseCase {
  constructor(private readonly repository: BranchCompanyRepository) {}

  async execute(id: number, companyId: number) {
    const branch = await this.repository.findById(id, companyId);
    if (!branch) throw new NotFoundException('Sucursal no encontrada');
    if (branch.isMatrix) return branch;
    if (!branch.enabled) throw new BadRequestException('Una sucursal deshabilitada no puede ser la matriz. Habilítala primero.');

    try {
      await this.repository.setMatrix(companyId, id);
    } catch (error) {
      mapMatrixConflict(error);
    }
    return this.repository.findById(id, companyId);
  }
}
