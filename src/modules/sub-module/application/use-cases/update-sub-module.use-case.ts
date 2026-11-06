import { subModulesRepository } from "../../domain/repositories/sub-module.repository";
import { Injectable } from "@nestjs/common";

@Injectable()
export class UpdatesubModulesUseCase {
  constructor(private readonly repository: subModulesRepository) {}

  async execute(    id: number,    moduleId: number,    dto: any  ) {
    const subModule = await this.repository.findById(id, moduleId);
    if (!subModule) throw new Error('subModules not found');

    subModule.moduleId = dto.moduleId ?? subModule.moduleId;
    subModule.code = dto.code ?? subModule.code;
    subModule.desc_icon = dto.desc_icon ?? subModule.desc_icon;
    subModule.description = dto.description ?? subModule.description;
    subModule.url_desc = dto.url_desc ?? subModule.url_desc;
    subModule.enabled = dto.enabled ?? subModule.enabled;

    return this.repository.update(subModule);
  }
}
