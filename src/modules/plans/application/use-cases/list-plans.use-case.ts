import { PlansRepository } from "../../domain/repositories/plans.repository";
import { ListPlansDto } from "../dto/list-plans.dto";
import { Injectable } from "@nestjs/common";

@Injectable()
export class ListPlansUseCase {
	constructor(
		private readonly repository: PlansRepository,
	) { }

	async execute(dto: ListPlansDto, user: any) {
		const result = await this.repository.findByPlans(dto.page, dto.limit);
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
