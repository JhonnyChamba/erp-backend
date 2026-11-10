import { Company } from "../entities/company.entity";

export abstract class CompanyRepository {
  abstract create(company: Company): Promise<Company>;

  abstract findByCompany(page: number, limit: number, companyIds?: number[] | null): Promise<{
    data: Company[];
    total: number;
  }>;

  abstract findById(id: number): Promise<Company | null>;
  
  abstract update(company: Company): Promise<Company>;
}