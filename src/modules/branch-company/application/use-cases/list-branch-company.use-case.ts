import { BranchCompanyRepository } from "../../domain/repositories/branch-company.repository";
import { ListBranchCompanyDto } from "../dto/list-branch-company.dto";
import { Injectable } from "@nestjs/common";

@Injectable()
export class ListBranchCompanyUseCase {
	constructor(
		private readonly repository: BranchCompanyRepository,
	) { }

	async execute(dto: ListBranchCompanyDto, user: any) {
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
