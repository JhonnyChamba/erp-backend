import { BranchCompany } from "../entities/branch-company.entity";

export abstract class BranchCompanyRepository {
  abstract create(branch: BranchCompany): Promise<BranchCompany>;
  abstract findByCompany(companyId: number, page: number, limit: number): Promise<{
    data: BranchCompany[];
    total: number;
  }>;
  abstract findById(id: number, companyId: number): Promise<BranchCompany | null>;
  abstract update(branch: BranchCompany): Promise<BranchCompany>;
}