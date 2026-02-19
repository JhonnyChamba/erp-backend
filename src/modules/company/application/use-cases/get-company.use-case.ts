import { CompanyRepository } from "../../domain/repositories/company.repository";
import { Injectable } from "@nestjs/common";

@Injectable()
export class GetCompanyUseCase {
  constructor(private readonly repository: CompanyRepository) { }

  async execute(id: number) {
    return this.repository.findById(id);
  }
}
