import { PlansModulesRepository } from "../../domain/repositories/plans-module.repository";
import { ListPlansModulesDto } from "../dto/list-plans-module.dto";
import { Injectable } from "@nestjs/common";

@Injectable()
export class ListPlansModulesUseCase {
	constructor(
		private readonly repository: PlansModulesRepository,
	) { }

	async execute(dto: ListPlansModulesDto, user: any) {
		const result = await this.repository.findByCompany(dto.planId, dto.page, dto.limit);
		return {
			data: result.data,
			meta: {
				total: result.total,
				page: dto.page,
				limit: dto.limit,
				totalPages: Math.ceil(result.total / dto.limit),
			},
		};
	}
}
