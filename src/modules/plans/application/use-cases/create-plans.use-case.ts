import { PlansRepository } from '../../domain/repositories/plans.repository';
import { Plans } from '../../domain/entities/plans.entity';
import { CreatePlansDto } from '../dto/create-plans.dto';
import { ForbiddenException, Injectable } from '@nestjs/common';

@Injectable()
export class CreatePlansUseCase {
	constructor(private readonly repository: PlansRepository) { }

	async execute(dto: CreatePlansDto, user: any) {
		const company = new Plans(
			null,
			dto.price,
			dto.billing_cycle,
			dto.description,
			dto.max_users,
			dto.max_branches,
			true,
			user.user_name, // 🔥 siempre del token
			// undefined,
			user.user_id, // 🔥 siempre del token
		);

		return this.repository.create(company);
	}

}
