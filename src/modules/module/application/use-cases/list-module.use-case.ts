import { ModuleRepository } from "../../domain/repositories/module.repository";
import { ListModuleDto } from "../dto/list-module.dto";
import { Injectable } from "@nestjs/common";

@Injectable()
export class ListModuleUseCase {
	constructor(
		private readonly repository: ModuleRepository,
	) { }

	async execute(dto: ListModuleDto, user: any) {
		const result = await this.repository.findByCompany(dto.page, dto.limit);
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
