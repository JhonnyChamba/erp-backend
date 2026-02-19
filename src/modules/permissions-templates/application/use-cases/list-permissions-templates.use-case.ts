import { PermissionsTemplatesRepository } from "../../domain/repositories/permissions-templates.repository";
import { ListPermissionsTemplatesDto } from "../dto/list-permissions-templates.dto";
import { Injectable } from "@nestjs/common";

@Injectable()
export class ListPermissionsTemplatesUseCase {
	constructor(
		private readonly repository: PermissionsTemplatesRepository,
	) { }

	async execute(dto: ListPermissionsTemplatesDto, user: any) {
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
