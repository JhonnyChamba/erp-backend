import { UserCompanyRepository } from "../../domain/repositories/user-company.repository";
import { ListUserCompanyDto } from "../dto/list-user-company.dto";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CompanyOrmEntity } from "src/modules/company/infrastructure/persistence/company.orm-entity";

@Injectable()
export class ListUserCompanyUseCase {
	constructor(
		private readonly repository: UserCompanyRepository,
		@InjectRepository(CompanyOrmEntity)
		private readonly companyRepo: Repository<CompanyOrmEntity>,
	) { }

	async execute(dto: ListUserCompanyDto, user: any) {
		const isSuperAdmin = user?.super_admin || user?.developer;
		const page = dto.page && dto.page > 0 ? dto.page : 1;
		const limit = dto.limit && dto.limit > 0 ? dto.limit : 10;

		// 1. Super Admin / Developer: acceso total a todas las empresas activas del ERP
		if (isSuperAdmin) {
			const [companies, total] = await this.companyRepo.findAndCount({
				where: { deleted: false, enabled: true },
				skip: (page - 1) * limit,
				take: limit,
				order: { business_name: 'ASC' },
			});

			return {
				data: companies.map(comp => ({
					id: comp.id,
					company: comp,
					enabled: true,
				})),
				meta: {
					total,
					page,
					limit,
					totalPages: Math.ceil(total / limit),
				},
			};
		}

		// 2. Usuario Multi-Empresa o usuario con asignaciones: lista empresas a través de tab_users_company
		const targetUserId = user?.user_id ?? dto.usersId;
		const result = await this.repository.findByCompany(targetUserId, page, limit);

		// Si tiene una empresa principal asignada (company_id) y no está en la lista de result.data, incluirla
		if (user?.company_id && !result.data.some(d => d.company?.id === user.company_id)) {
			const primaryComp = await this.companyRepo.findOne({
				where: { id: user.company_id, deleted: false },
			});
			if (primaryComp) {
				result.data.unshift({
					id: 0,
					usersId: targetUserId,
					companyId: primaryComp.id,
					enabled: true,
					company: primaryComp as any,
				} as any);
				result.total += 1;
			}
		}

		// Si después de todo result.total sigue en 0 pero se encuentra por dto.companyId
		if (result.total === 0 && dto.companyId) {
			const singleComp = await this.companyRepo.findOne({
				where: { id: dto.companyId, deleted: false },
			});
			if (singleComp) {
				return {
					data: [{ id: 0, company: singleComp, enabled: true }],
					meta: { total: 1, page: 1, limit, totalPages: 1 },
				};
			}
		}

		return {
			data: result.data,
			meta: {
				total: result.total,
				page,
				limit,
				totalPages: Math.ceil(result.total / limit),
			},
		};
	}
}
