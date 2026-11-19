import { RolesTemplatesRepository } from "../../domain/repositories/roles-templates.repository";
import { Injectable, NotFoundException } from "@nestjs/common";

@Injectable()
export class UpdateRolesTemplatesUseCase {
  constructor(private readonly repository: RolesTemplatesRepository) { }

  async execute(id: number, dto: any) {
    const branch = await this.repository.findById(id);
    if (!branch) throw new NotFoundException('RolesTemplates not found');

    branch.code = dto.code ?? branch.code;
    branch.description = dto.description ?? branch.description;
    branch.enabled = dto.enabled ?? branch.enabled;

    return this.repository.update(branch);
  }
}
