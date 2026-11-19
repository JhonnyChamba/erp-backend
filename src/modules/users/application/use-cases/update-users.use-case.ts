import { UsersRepository } from "../../domain/repositories/users.repository";
import { Injectable, NotFoundException } from "@nestjs/common";
import { PasswordService } from "src/common/password/password.service";
import { UpdateUsersDto } from "../dto/update-users.dto";
import { UsersAccessPolicy } from "../users-access.policy";

@Injectable()
export class UpdateUsersUseCase {
  constructor(
    private readonly repository: UsersRepository,
    private readonly passwordService: PasswordService,
    private readonly accessPolicy: UsersAccessPolicy,
  ) {}

  async execute(id: number, companyId: number, dto: UpdateUsersDto, currentUser?: any) {
    // null = quien llama es super admin / developer (consultado en BD, no en el token)
    const actorCompanyIds = await this.accessPolicy.getActorCompanyIds(currentUser);
    const canGrantSuperAdmin = actorCompanyIds === null;

    // Solo un super admin puede alcanzar usuarios fuera de la empresa activa
    const user = await this.repository.findById(id, companyId, canGrantSuperAdmin);
    if (!user) throw new NotFoundException('User not found');

    if (actorCompanyIds !== null) {
      this.accessPolicy.assertCanManageTarget(actorCompanyIds, user);
      await this.accessPolicy.assertCanAssign(actorCompanyIds, {
        companyId: user.companyId,
        roleId: dto.roleId,
        companyIds: dto.companyIds,
        companyRoles: dto.companyRoles,
      });
    }

    user.num_document = dto.num_document ?? user.num_document;
    user.name_user = dto.name_user ?? user.name_user;
    user.last_name_user = dto.last_name_user ?? user.last_name_user;
    user.email = dto.email ?? user.email;
    if (dto.password) {
      user.password = await this.passwordService.hash(dto.password);
    }
    if (canGrantSuperAdmin) {
      user.developer = dto.developer ?? user.developer;
      user.super_admin = dto.super_admin ?? user.super_admin;
    }
    user.multi_company = user.super_admin ? false : (dto.multi_company ?? user.multi_company);
    if (user.multi_company) {
      user.super_admin = false;
      user.developer = false;
    }
    user.enabled = dto.enabled ?? user.enabled;
    user.theme_color = dto.theme_color ?? user.theme_color;
    user.theme_mode = dto.theme_mode ?? user.theme_mode;
    if (dto.birth_date !== undefined) user.birth_date = dto.birth_date || null;
    if (dto.photo_url !== undefined) user.photo_url = dto.photo_url || null;
    if (dto.companyIds !== undefined) {
      user.companyIds = user.super_admin ? [] : dto.companyIds;
    }
    if (dto.roleId !== undefined) {
      user.roleId = user.super_admin ? null : dto.roleId;
    }
    if (dto.companyRoles !== undefined) {
      user.companyRoles = user.super_admin ? [] : dto.companyRoles;
    }

    return this.repository.update(user);
  }
}
