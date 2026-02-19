import { SubscriptionsRepository } from "../../domain/repositories/subscriptions.repository";
import { ListSubscriptionsDto } from "../dto/list-subscriptions.dto";
import { Injectable } from "@nestjs/common";

@Injectable()
export class ListSubscriptionsUseCase {
	constructor(
		private readonly repository: SubscriptionsRepository,
	) { }

	async execute(dto: ListSubscriptionsDto, user: any) {
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
