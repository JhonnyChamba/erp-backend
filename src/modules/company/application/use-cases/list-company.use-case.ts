import { CompanyRepository } from "../../domain/repositories/company.repository";
import { ListCompanyDto } from "../dto/list-company.dto";
import { Injectable } from "@nestjs/common";

@Injectable()
export class ListCompanyUseCase {
	constructor(
		private readonly repository: CompanyRepository,
	) { }

	async execute(dto: ListCompanyDto, user: any) {
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
