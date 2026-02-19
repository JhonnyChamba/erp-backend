import { PlansModulesRepository } from '../../domain/repositories/plans-module.repository';
import { PlansModules } from '../../domain/entities/plans-module.entity';
import { CreatePlansModulesDto } from '../dto/create-plans-module.dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CreatePlansModulesUseCase {
	constructor(private readonly repository: PlansModulesRepository) { }

	async execute(dto: CreatePlansModulesDto, user: any) {
		const subModule = new PlansModules(
			null,
			dto.planId,
			dto.moduleId,
		);

		return this.repository.create(subModule);
	}
}