import { ModuleRepository } from "../../domain/repositories/module.repository";
import { Injectable } from "@nestjs/common";

@Injectable()
export class UpdateModuleUseCase {
  constructor(private readonly repository: ModuleRepository) { }

  async execute(id: number, dto: any) {
    const branch = await this.repository.findById(id);
    if (!branch) throw new Error('Module not found');

    branch.code = dto.code ?? branch.code;
    branch.desc_icon = dto.desc_icon ?? branch.desc_icon;
    branch.description = dto.description ?? branch.description;
    branch.enabled = dto.enabled ?? branch.enabled;

    return this.repository.update(branch);
  }
}
