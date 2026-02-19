import { UserCompanyRepository } from "../../domain/repositories/user-company.repository";
import { ListUserCompanyDto } from "../dto/list-user-company.dto";
import { Injectable } from "@nestjs/common";

@Injectable()
export class ListUserCompanyUseCase {
	constructor(
		private readonly repository: UserCompanyRepository,
	) { }

	async execute(dto: ListUserCompanyDto, user: any) {
		const result = await this.repository.findByCompany(dto.usersId, dto.page, dto.limit);
		console.log(result);		
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
