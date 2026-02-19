import { RolesTemplatesRepository } from "../../domain/repositories/roles-templates.repository";
import { Injectable } from "@nestjs/common";

@Injectable()
export class GetRolesTemplatesUseCase {
  constructor(private readonly repository: RolesTemplatesRepository) { }

  async execute(id: number) {
    return this.repository.findById(id);
  }
}
