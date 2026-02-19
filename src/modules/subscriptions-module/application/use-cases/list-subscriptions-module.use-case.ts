import { SubscriptionsModuleRepository } from "../../domain/repositories/subscriptions-module.repository";
import { ListSubscriptionsModuleDto } from "../dto/list-subscriptions-module.dto";
import { Injectable } from "@nestjs/common";

@Injectable()
export class ListSubscriptionsModuleUseCase {
	constructor(
		private readonly repository: SubscriptionsModuleRepository,
	) { }

	async execute(dto: ListSubscriptionsModuleDto, user: any) {
		const result = await this.repository.findByCompany(dto.subscriptionId, dto.page, dto.limit);
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
