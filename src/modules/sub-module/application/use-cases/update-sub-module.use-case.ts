import { subModulesRepository } from "../../domain/repositories/sub-module.repository";
import { Injectable, NotFoundException } from "@nestjs/common";

@Injectable()
export class UpdatesubModulesUseCase {
  constructor(private readonly repository: subModulesRepository) {}

  async execute(    id: number,    moduleId: number,    dto: any  ) {
    const subModule = await this.repository.findById(id, moduleId);
    if (!subModule) throw new NotFoundException('subModules not found');

    subModule.moduleId = dto.moduleId ?? subModule.moduleId;
    subModule.code = dto.code ?? subModule.code;
    subModule.desc_icon = dto.desc_icon ?? subModule.desc_icon;
    subModule.description = dto.description ?? subModule.description;
    subModule.url_desc = dto.url_desc ?? subModule.url_desc;
    subModule.enabled = dto.enabled ?? subModule.enabled;
    // findById ya trae el order_index actual; solo se cambia si viene en el DTO.
    if (dto.order_index !== undefined && dto.order_index !== null) {
      (subModule as any).order_index = Number(dto.order_index);
    }

    return this.repository.update(subModule);
  }
}
