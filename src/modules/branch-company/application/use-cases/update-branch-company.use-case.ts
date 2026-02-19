import { BranchCompanyRepository } from "../../domain/repositories/branch-company.repository";
import { Injectable } from "@nestjs/common";

@Injectable()
export class UpdateBranchCompanyUseCase {
  constructor(private readonly repository: BranchCompanyRepository) {}

  async execute(    id: number,    companyId: number,    dto: any  ) {
    const branch = await this.repository.findById(id, companyId);
    if (!branch) throw new Error('BranchCompany not found');

    branch.code = dto.code ?? branch.code;
    branch.name = dto.name ?? branch.name;
    branch.address = dto.address ?? branch.address;
    branch.enabled = dto.enabled ?? branch.enabled;

    return this.repository.update(branch);
  }
}
