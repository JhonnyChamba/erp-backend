import { PlansModulesRepository } from "../../domain/repositories/plans-module.repository";
import { Injectable } from "@nestjs/common";

@Injectable()
export class GetPlansModulesUseCase {
  constructor(private readonly repository: PlansModulesRepository) {}

  async execute(id: number, planId: number) {
    return this.repository.findById(id, planId);
  }
}
