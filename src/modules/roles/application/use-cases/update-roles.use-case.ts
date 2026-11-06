import { RolesRepository } from "../../domain/repositories/roles.repository";
import { Injectable } from "@nestjs/common";

@Injectable()
export class UpdateRolesUseCase {
  constructor(private readonly repository: RolesRepository) {}

  async execute(id: number, companyId: number, dto: any) {
    const branch = await this.repository.findById(id, companyId);
    if (!branch) throw new Error('Roles not found');

    branch.code = dto.code ?? branch.code;
    branch.description = dto.description ?? branch.description;
    branch.enabled = dto.enabled ?? branch.enabled;
    if (dto.moduleIds !== undefined) {
      branch.moduleIds = dto.moduleIds;
    }
    if (dto.subModuleIds !== undefined) {
      branch.subModuleIds = dto.subModuleIds;
    }
    if (dto.details !== undefined) {
      branch.details = dto.details;
    }

    return this.repository.update(branch);
  }
}
