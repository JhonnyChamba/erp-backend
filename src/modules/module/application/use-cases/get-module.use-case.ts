import { ModuleRepository } from "../../domain/repositories/module.repository";
import { Injectable } from "@nestjs/common";

@Injectable()
export class GetModuleUseCase {
  constructor(private readonly repository: ModuleRepository) { }

  async execute(id: number) {
    return this.repository.findById(id);
  }
}
