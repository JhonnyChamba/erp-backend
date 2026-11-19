import { PermissionsTemplatesRepository } from "../../domain/repositories/permissions-templates.repository";
import { Injectable, NotFoundException } from "@nestjs/common";

@Injectable()
export class UpdatePermissionsTemplatesUseCase {
  constructor(private readonly repository: PermissionsTemplatesRepository) { }

  async execute(id: number, dto: any) {
    const branch = await this.repository.findById(id);
    if (!branch) throw new NotFoundException('PermissionsTemplates not found');

    branch.code = dto.code ?? branch.code;
    branch.description = dto.description ?? branch.description;
    branch.enabled = dto.enabled ?? branch.enabled;

    return this.repository.update(branch);
  }
}
