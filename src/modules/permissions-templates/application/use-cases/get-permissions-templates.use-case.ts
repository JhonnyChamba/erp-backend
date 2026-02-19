import { PermissionsTemplatesRepository } from "../../domain/repositories/permissions-templates.repository";
import { Injectable } from "@nestjs/common";

@Injectable()
export class GetPermissionsTemplatesUseCase {
  constructor(private readonly repository: PermissionsTemplatesRepository) { }

  async execute(id: number) {
    return this.repository.findById(id);
  }
}
