import { RolesTemplatesRepository } from '../../domain/repositories/roles-templates.repository';
import { RolesTemplates } from '../../domain/entities/roles-templates.entity';
import { CreateRolesTemplatesDto } from '../dto/create-roles-templates.dto';
import { ForbiddenException, Injectable } from '@nestjs/common';

@Injectable()
export class CreateRolesTemplatesUseCase {
	constructor(private readonly repository: RolesTemplatesRepository) { }

	async execute(dto: CreateRolesTemplatesDto, user: any) {
		const branch = new RolesTemplates(
			null,
			dto.code,
			dto.description,
			true,
			undefined,
			user.user_id, // 🔥 siempre del token
		);

		return this.repository.create(branch);
	}

}
