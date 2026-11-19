import { UsersRepository } from '../../domain/repositories/users.repository';
import { Users } from '../../domain/entities/users.entity';
import { CreateUsersDto } from '../dto/create-users.dto';
import { UsersAccessPolicy } from '../users-access.policy';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CreateUsersUseCase {
	constructor(
		private readonly repository: UsersRepository,
		private readonly accessPolicy: UsersAccessPolicy,
	) { }

	async execute(dto: CreateUsersDto, currentUser?: any) {
		// null = quien llama es super admin / developer (consultado en BD, no en el token)
		const actorCompanyIds = await this.accessPolicy.getActorCompanyIds(currentUser);
		const canGrantSuperAdmin = actorCompanyIds === null;
		const isSuperAdmin = canGrantSuperAdmin ? Boolean(dto.super_admin) : false;
		const isMultiCompany = isSuperAdmin ? false : Boolean(dto.multi_company);

		if (actorCompanyIds !== null) {
			await this.accessPolicy.assertCanAssign(actorCompanyIds, {
				companyId: dto.companyId,
				roleId: dto.roleId,
				companyIds: dto.companyIds,
				companyRoles: dto.companyRoles,
			});
		}

		const user = new Users(
			null,
			dto.num_document,
			dto.name_user,
			dto.last_name_user,
			dto.email,
			dto.password,
			dto.companyId,
			isSuperAdmin,
			isMultiCompany,
			true,
			false,
			undefined,
			dto.theme_color || 'Blue_Theme',
			isSuperAdmin,
			isSuperAdmin ? [] : dto.companyIds || [],
			isSuperAdmin ? null : dto.roleId ?? null,
			null,
			isSuperAdmin ? [] : dto.companyRoles || [],
			dto.birth_date || null,
			dto.photo_url || '/controller/images/profile/user-1.jpg',
			dto.theme_mode || 'dark',
		);

		return this.repository.create(user);
	}
}
