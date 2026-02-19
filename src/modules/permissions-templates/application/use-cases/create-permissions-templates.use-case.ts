import { PermissionsTemplatesRepository } from '../../domain/repositories/permissions-templates.repository';
import { PermissionsTemplates } from '../../domain/entities/permissions-templates.entity';
import { CreatePermissionsTemplatesDto } from '../dto/create-permissions-templates.dto';
import { ForbiddenException, Injectable } from '@nestjs/common';

@Injectable()
export class CreatePermissionsTemplatesUseCase {
	constructor(private readonly repository: PermissionsTemplatesRepository) { }

	async execute(dto: CreatePermissionsTemplatesDto, user: any) {
		const branch = new PermissionsTemplates(
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
