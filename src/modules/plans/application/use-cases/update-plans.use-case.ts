import { PlansRepository } from "../../domain/repositories/plans.repository";
import { Injectable } from "@nestjs/common";

@Injectable()
export class UpdatePlansUseCase {
  constructor(private readonly repository: PlansRepository) { }

  async execute(id: number, dto: any) {
    const company = await this.repository.findById(id);
    if (!company) throw new Error('Plans not found');

    company.price = dto.price ?? company.price;
    company.billing_cycle = dto.billing_cycle ?? company.billing_cycle;
    company.description = dto.description ?? company.description;
    company.max_users = dto.max_users ?? company.max_users;
    company.max_branches = dto.max_branches ?? company.max_branches;
    company.enabled = dto.enabled ?? company.enabled;
    if (dto.moduleIds !== undefined) {
      company.moduleIds = dto.moduleIds;
    }
    if (dto.subModuleIds !== undefined) {
      company.subModuleIds = dto.subModuleIds;
    }

    return this.repository.update(company);
  }
}
