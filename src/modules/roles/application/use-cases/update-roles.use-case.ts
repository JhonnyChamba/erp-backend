import { RolesRepository } from "../../domain/repositories/roles.repository";
import { Injectable } from "@nestjs/common";

@Injectable()
export class UpdateRolesUseCase {
  constructor(private readonly repository: RolesRepository) {}

  async execute(    id: number,    companyId: number,    dto: any  ) {
    const branch = await this.repository.findById(id, companyId);
    if (!branch) throw new Error('Roles not found');

    branch.code = dto.code ?? branch.code;
    branch.description = dto.description ?? branch.description;
    branch.enabled = dto.enabled ?? branch.enabled;

    return this.repository.update(branch);
  }
}
