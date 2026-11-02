import { UsersRepository } from "../../domain/repositories/users.repository";
import { Injectable, NotFoundException } from "@nestjs/common";
import { PasswordService } from "src/common/password/password.service";
import { UpdateUsersDto } from "../dto/update-users.dto";

@Injectable()
export class UpdateUsersUseCase {
  constructor(
    private readonly repository: UsersRepository,
    private readonly passwordService: PasswordService,
  ) {}

  async execute(id: number, companyId: number, dto: UpdateUsersDto) {
    const user = await this.repository.findById(id, companyId);
    if (!user) throw new NotFoundException('User not found');

    user.num_document = dto.num_document ?? user.num_document;
    user.name_user = dto.name_user ?? user.name_user;
    user.last_name_user = dto.last_name_user ?? user.last_name_user;
    user.email = dto.email ?? user.email;
    if (dto.password) {
      user.password = await this.passwordService.hash(dto.password);
    }
    user.developer = dto.developer ?? user.developer;
    user.super_admin = dto.super_admin ?? user.super_admin;
    user.multi_company = dto.multi_company ?? user.multi_company;
    user.enabled = dto.enabled ?? user.enabled;
    user.theme_color = dto.theme_color ?? user.theme_color;
    if (dto.companyIds !== undefined) {
      user.companyIds = dto.companyIds;
    }

    return this.repository.update(user);
  }
}
