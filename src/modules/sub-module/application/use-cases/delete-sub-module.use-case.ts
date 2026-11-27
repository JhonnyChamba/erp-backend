import { Injectable, NotFoundException } from "@nestjs/common";
import { subModulesRepository } from "../../domain/repositories/sub-module.repository";

@Injectable()
export class DeletesubModulesUseCase {
  constructor(private readonly repository: subModulesRepository) {}

  async execute(id: number) {
    const subModule = await this.repository.findById(id, 0);
    if (!subModule) {
      throw new NotFoundException('Submódulo no encontrado');
    }
    await this.repository.softDelete(id);
    return { deleted: true };
  }
}
