import { ModuleRepository } from '../../domain/repositories/module.repository';
import { Module } from '../../domain/entities/module.entity';
import { CreateModuleDto } from '../dto/create-module.dto';
import { ForbiddenException, Injectable } from '@nestjs/common';

@Injectable()
export class CreateModuleUseCase {
	constructor(private readonly repository: ModuleRepository) { }

	async execute(dto: CreateModuleDto, user: any) {
		const branch = new Module(
			null,
			dto.code,
			dto.desc_icon,
			dto.description,
			true,
			undefined,
			user.user_id, // 🔥 siempre del token
		);

		// El repositorio persiste order_index leyéndolo de la entidad de dominio.
		(branch as any).order_index = dto.order_index ?? 0;

		return this.repository.create(branch);
	}

}
