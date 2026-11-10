import { BranchCompanyRepository } from "../../domain/repositories/branch-company.repository";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";

@Injectable()
export class DeleteBranchCompanyUseCase {
  constructor(private readonly repository: BranchCompanyRepository) {}

  async execute(id: number, companyId: number) {
    const branch = await this.repository.findById(id, companyId);
    if (!branch) throw new NotFoundException('Sucursal no encontrada');
    if (branch.isMatrix) {
      throw new BadRequestException('No se puede eliminar la sucursal matriz. Marca otra sucursal como matriz primero.');
    }
    // Eliminación lógica: las facturas ya emitidas conservan el establecimiento y la dirección con que se emitieron.
    await this.repository.softDelete(id, companyId);
    return { success: true };
  }
}
