import { UsersRepository } from '../../domain/repositories/users.repository';
import { Users } from '../../domain/entities/users.entity';
import { CreateUsersDto } from '../dto/create-users.dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CreateUsersUseCase {
	constructor(private readonly repository: UsersRepository) { }

	async execute(dto: CreateUsersDto) {
		const isSuperAdmin = Boolean(dto.super_admin);
		const isMultiCompany = isSuperAdmin ? false : Boolean(dto.multi_company);

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
		);

		return this.repository.create(user);
	}
}
