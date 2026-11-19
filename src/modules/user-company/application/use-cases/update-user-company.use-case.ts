import { UserCompanyRepository } from "../../domain/repositories/user-company.repository";
import { Injectable, NotFoundException } from "@nestjs/common";

@Injectable()
export class UpdateUserCompanyUseCase {
  constructor(private readonly repository: UserCompanyRepository) { }

  async execute(id: number, usersId: number, dto: any) {
    const branch = await this.repository.findById(id, usersId);
    if (!branch) throw new NotFoundException('UserCompany not found');

    branch.enabled = dto.enabled ?? branch.enabled;

    return this.repository.update(branch);
  }
}
