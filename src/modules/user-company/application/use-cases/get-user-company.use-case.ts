import { UserCompanyRepository } from "../../domain/repositories/user-company.repository";
import { Injectable } from "@nestjs/common";

@Injectable()
export class GetUserCompanyUseCase {
  constructor(private readonly repository: UserCompanyRepository) {}

  async execute(id: number, UserCompany: number) {
    return this.repository.findById(id, UserCompany);
  }
}
