import { UsersRepository } from "../../domain/repositories/users.repository";
import { ListUsersDto } from "../dto/list-users.dto";
import { Injectable } from "@nestjs/common";

@Injectable()
export class ListUsersUseCase {
	constructor(
		private readonly repository: UsersRepository,
	) { }

	async execute(dto: ListUsersDto, user: any) {
		const result = await this.repository.findByCompany(dto.companyId, dto.page, dto.limit);
		return {
			data: result.data,
			meta: {
				total: result.total,
				page: dto.page,
				limit: dto.limit,
				totalPages: Math.ceil(result.total / dto.limit)
			}
		};
	}
}
