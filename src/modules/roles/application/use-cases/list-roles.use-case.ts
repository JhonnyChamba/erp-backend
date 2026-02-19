import { RolesRepository } from "../../domain/repositories/roles.repository";
import { ListRolesDto } from "../dto/list-roles.dto";
import { Injectable } from "@nestjs/common";

@Injectable()
export class ListRolesUseCase {
	constructor(
		private readonly repository: RolesRepository,
	) { }

	async execute(dto: ListRolesDto, user: any) {
		const result = await this.repository.findByCompany(dto.companyId, dto.page, dto.limit);
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
