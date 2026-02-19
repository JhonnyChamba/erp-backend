import { PlansModulesRepository } from "../../domain/repositories/plans-module.repository";
import { Injectable } from "@nestjs/common";

@Injectable()
export class UpdatePlansModulesUseCase {
  constructor(private readonly repository: PlansModulesRepository) { }

  async execute(id: number, planId: number, dto: any) {
    const subModule = await this.repository.findById(id, planId);
    if (!subModule) throw new Error('PlansModules not found');

    return this.repository.update(subModule);
  }
}
