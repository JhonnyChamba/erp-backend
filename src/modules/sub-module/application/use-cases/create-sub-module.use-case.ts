import { subModulesRepository } from '../../domain/repositories/sub-module.repository';
import { subModules } from '../../domain/entities/sub-module.entity';
import { CreatesubModulesDto } from '../dto/create-sub-module.dto';
import { ForbiddenException, Injectable } from '@nestjs/common';

@Injectable()
export class CreatesubModulesUseCase {
	constructor(private readonly repository: subModulesRepository) { }

	async execute(dto: CreatesubModulesDto, user: any) {
		const subModule = new subModules(
			null,
			dto.code,
			dto.desc_icon,
			dto.description,
			dto.url_desc,
			dto.moduleId,
			true,
			undefined,
			user.user_id, // 🔥 siempre del token
		);

		return this.repository.create(subModule);
	}

}
