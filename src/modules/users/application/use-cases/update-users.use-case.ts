import { UsersRepository } from "../../domain/repositories/users.repository";
import { Injectable } from "@nestjs/common";

@Injectable()
export class UpdateUsersUseCase {
  constructor(private readonly repository: UsersRepository) {}

  async execute(    id: number,    companyId: number,    dto: any  ) {
    const branch = await this.repository.findById(id, companyId);
    if (!branch) throw new Error('Users not found');

    branch.num_document = dto.num_document ?? branch.num_document;
    branch.name_user = dto.name_user ?? branch.name_user;
    branch.last_name_user = dto.last_name_user ?? branch.last_name_user;
    branch.email = dto.email ?? branch.email;
    branch.password = dto.password ?? branch.password;
    branch.developer = dto.developer ?? branch.developer;
    branch.multi_company = dto.multi_company ?? branch.multi_company;
    branch.enabled = dto.enabled ?? branch.enabled;
    branch.theme_color = dto.theme_color ?? branch.theme_color;

    return this.repository.update(branch);
  }
}
