import { subModulesRepository } from "../../domain/repositories/sub-module.repository";
import { Injectable } from "@nestjs/common";

@Injectable()
export class GetsubModulesUseCase {
  constructor(private readonly repository: subModulesRepository) {}

  async execute(id: number, moduleId: number) {
    return this.repository.findById(id, moduleId);
  }
}
