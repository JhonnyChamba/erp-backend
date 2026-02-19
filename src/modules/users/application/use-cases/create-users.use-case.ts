import { UsersRepository } from '../../domain/repositories/users.repository';
import { Users } from '../../domain/entities/users.entity';
import { CreateUsersDto } from '../dto/create-users.dto';
import { ForbiddenException, Injectable } from '@nestjs/common';

@Injectable()
export class CreateUsersUseCase {
	constructor(private readonly repository: UsersRepository) { }

	async execute(dto: CreateUsersDto) {	//, user: any
		const branch = new Users(
			null,
			dto.num_document,
			dto.name_user,
			dto.last_name_user,
			dto.email,
			dto.password,
			dto.companyId,
			false,
			false,
			true,
			undefined,
			// user.user_id, // 🔥 siempre del token
		);

		return this.repository.create(branch);
	}

}
