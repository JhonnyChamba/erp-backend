import { RolesTemplatesRepository } from "../../domain/repositories/roles-templates.repository";
import { ListRolesTemplatesDto } from "../dto/list-roles-templates.dto";
import { Injectable } from "@nestjs/common";

@Injectable()
export class ListRolesTemplatesUseCase {
	constructor(
		private readonly repository: RolesTemplatesRepository,
	) { }

	async execute(dto: ListRolesTemplatesDto, user: any) {
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
