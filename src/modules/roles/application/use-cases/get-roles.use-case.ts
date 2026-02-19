import { RolesRepository } from "../../domain/repositories/roles.repository";
import { Injectable } from "@nestjs/common";

@Injectable()
export class GetRolesUseCase {
  constructor(private readonly repository: RolesRepository) {}

  async execute(id: number, companyId: number) {
    return this.repository.findById(id, companyId);
  }
}
