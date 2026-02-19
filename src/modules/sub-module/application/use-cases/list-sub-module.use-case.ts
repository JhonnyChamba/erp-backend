import { subModulesRepository } from "../../domain/repositories/sub-module.repository";
import { ListsubModulesDto } from "../dto/list-sub-module.dto";
import { Injectable } from "@nestjs/common";

@Injectable()
export class ListsubModulesUseCase {
	constructor(
		private readonly repository: subModulesRepository,
	) { }

	async execute(dto: ListsubModulesDto, user: any) {
		const result = await this.repository.findByCompany(dto.moduleId, dto.page, dto.limit);
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
