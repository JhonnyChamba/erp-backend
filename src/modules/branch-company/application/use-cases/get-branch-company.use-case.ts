import { BranchCompanyRepository } from "../../domain/repositories/branch-company.repository";
import { Injectable } from "@nestjs/common";

@Injectable()
export class GetBranchCompanyUseCase {
  constructor(private readonly repository: BranchCompanyRepository) {}

  async execute(id: number, companyId: number) {
    return this.repository.findById(id, companyId);
  }
}
