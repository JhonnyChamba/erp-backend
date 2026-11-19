import { UsersRepository } from "../../domain/repositories/users.repository";
import { ListUsersDto } from "../dto/list-users.dto";
import { UsersAccessPolicy } from "../users-access.policy";
import { Injectable } from "@nestjs/common";

@Injectable()
export class ListUsersUseCase {
	constructor(
		private readonly repository: UsersRepository,
		private readonly accessPolicy: UsersAccessPolicy,
	) { }

	async execute(dto: ListUsersDto, user: any, activeCompanyId?: number) {
		// Sin `companyId` solo un super admin lista usuarios de todas las empresas; el resto, la empresa activa
		const isSuperAdmin = (await this.accessPolicy.getActorCompanyIds(user)) === null;
		const companyId = isSuperAdmin ? dto.companyId : (dto.companyId || activeCompanyId);
		if (!isSuperAdmin && !companyId) {
			return { data: [], meta: { total: 0, page: dto.page, limit: dto.limit, totalPages: 0 } };
		}

		const result = await this.repository.findByCompany(companyId, dto.page, dto.limit);
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
