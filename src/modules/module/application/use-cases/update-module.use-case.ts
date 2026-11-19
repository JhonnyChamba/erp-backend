import { ModuleRepository } from "../../domain/repositories/module.repository";
import { Injectable, NotFoundException } from "@nestjs/common";

@Injectable()
export class UpdateModuleUseCase {
  constructor(private readonly repository: ModuleRepository) { }

  async execute(id: number, dto: any) {
    const branch = await this.repository.findById(id);
    if (!branch) throw new NotFoundException('Module not found');

    branch.code = dto.code ?? branch.code;
    branch.desc_icon = dto.desc_icon ?? branch.desc_icon;
    branch.description = dto.description ?? branch.description;
    branch.enabled = dto.enabled ?? branch.enabled;
    // findById ya trae el order_index actual; solo se cambia si viene en el DTO.
    if (dto.order_index !== undefined && dto.order_index !== null) {
      (branch as any).order_index = Number(dto.order_index);
    }

    return this.repository.update(branch);
  }
}
