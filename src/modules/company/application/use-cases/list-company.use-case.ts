import { CompanyRepository } from "../../domain/repositories/company.repository";
import { ListCompanyDto } from "../dto/list-company.dto";
import { AccessControlService } from "src/auth/access-control.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class ListCompanyUseCase {
	constructor(
		private readonly repository: CompanyRepository,
		private readonly accessControlService: AccessControlService,
	) { }

	async execute(dto: ListCompanyDto, user: any) {
		// Solo las empresas a las que el usuario pertenece (null = super admin: todas)
		const companyIds = await this.accessControlService.getAccessibleCompanyIds(user);
		const result = await this.repository.findByCompany(dto.page, dto.limit, companyIds);
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
