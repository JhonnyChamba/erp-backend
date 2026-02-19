import { CompanyRepository } from "../../domain/repositories/company.repository";
import { Injectable } from "@nestjs/common";

@Injectable()
export class UpdateCompanyUseCase {
  constructor(private readonly repository: CompanyRepository) { }

  async execute(id: number, dto: any) {
    const company = await this.repository.findById(id);
    if (!company) throw new Error('Company not found');

    company.ruc = dto.ruc ?? company.ruc;
    company.description = dto.description ?? company.description;
    company.business_name = dto.business_name ?? company.business_name;
    company.trade_name = dto.trade_name ?? company.trade_name;
    company.enabled = dto.enabled ?? company.enabled;

    return this.repository.update(company);
  }
}
