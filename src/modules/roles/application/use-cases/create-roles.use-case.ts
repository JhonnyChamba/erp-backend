import { RolesRepository } from '../../domain/repositories/roles.repository';
import { Roles } from '../../domain/entities/roles.entity';
import { CreateRolesDto } from '../dto/create-roles.dto';
import { ForbiddenException, Injectable } from '@nestjs/common';

@Injectable()
export class CreateRolesUseCase {
	constructor(private readonly repository: RolesRepository) { }

	async execute(dto: CreateRolesDto, user: any) {
		const branch = new Roles(
			null,
			dto.code,
			dto.description,
			dto.companyId,
			true,
			undefined,
			user.user_id, // 🔥 siempre del token
		);

		return this.repository.create(branch);
	}

}
