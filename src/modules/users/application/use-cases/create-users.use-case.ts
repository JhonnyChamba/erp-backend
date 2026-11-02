import { UsersRepository } from '../../domain/repositories/users.repository';
import { Users } from '../../domain/entities/users.entity';
import { CreateUsersDto } from '../dto/create-users.dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CreateUsersUseCase {
	constructor(private readonly repository: UsersRepository) { }

	async execute(dto: CreateUsersDto) {
		const user = new Users(
			null,
			dto.num_document,
			dto.name_user,
			dto.last_name_user,
			dto.email,
			dto.password,
			dto.companyId,
			dto.developer ?? false,
			dto.multi_company ?? false,
			true,
			false,
			undefined,
			dto.theme_color || 'Blue_Theme',
			dto.super_admin ?? false,
			dto.companyIds || [],
		);

		return this.repository.create(user);
	}
}
