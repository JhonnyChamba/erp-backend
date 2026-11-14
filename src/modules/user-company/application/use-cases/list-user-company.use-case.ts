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

			const rawData = companies.map(comp => ({
				id: comp.id,
				company: comp,
				enabled: true,
			}));

			return {
				data: await this.attachSubscriptionInfo(rawData),
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
				const singleData = [{ id: 0, company: singleComp, enabled: true }];
				return {
					data: await this.attachSubscriptionInfo(singleData),
					meta: { total: 1, page: 1, limit, totalPages: 1 },
				};
			}
		}

		return {
			data: await this.attachSubscriptionInfo(result.data),
			meta: {
				total: result.total,
				page,
				limit,
				totalPages: Math.ceil(result.total / limit),
			},
		};
	}

	private async attachSubscriptionInfo(items: any[]): Promise<any[]> {
		if (!items.length) return items;
		const compIds = items.map((i) => i.company?.id || i.id).filter(Boolean);
		if (!compIds.length) return items;

		const now = new Date();
		const subs: any[] = await this.companyRepo.manager.query(
			`SELECT s.id, s.company_id, s.begin_date, s.end_date, s.enabled, p.description as plan_name
			 FROM tab_subscriptions s
			 LEFT JOIN tab_plans p ON p.id = s.plan_id
			 WHERE s.company_id = ANY($1) AND s.deleted = false
			 ORDER BY s.id DESC`,
			[compIds],
		);

		return items.map((item) => {
			const cId = Number(item.company?.id || item.id);
			const compSubs = subs.filter((s: any) => Number(s.company_id) === cId);
			const activeSub = compSubs.find((s: any) => {
				if (s.enabled === false) return false;
				if (!s.end_date) return true;
				const end = new Date(s.end_date);
				if (isNaN(end.getTime())) return true;
				end.setHours(23, 59, 59, 999);
				return end >= now;
			});

			let subscriptionInfo: any;
			if (activeSub) {
				subscriptionInfo = {
					hasActiveSubscription: true,
					status: 'active',
					planName: activeSub.plan_name,
					endDate: activeSub.end_date,
				};
			} else if (compSubs.length > 0) {
				subscriptionInfo = {
					hasActiveSubscription: false,
					status: 'expired',
					planName: compSubs[0].plan_name,
					endDate: compSubs[0].end_date,
				};
			} else {
				subscriptionInfo = {
					hasActiveSubscription: false,
					status: 'no_subscription',
					planName: null,
					endDate: null,
				};
			}

			return {
				...item,
				subscription: subscriptionInfo,
				company: item.company
					? { ...item.company, subscription: subscriptionInfo }
					: item.company,
			};
		});
	}
}
