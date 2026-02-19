import { SubscriptionsRepository } from '../../domain/repositories/subscriptions.repository';
import { Subscriptions } from '../../domain/entities/subscriptions.entity';
import { CreateSubscriptionsDto } from '../dto/create-subscriptions.dto';
import { ForbiddenException, Injectable } from '@nestjs/common';

@Injectable()
export class CreateSubscriptionsUseCase {
	constructor(private readonly repository: SubscriptionsRepository) { }

	async execute(dto: CreateSubscriptionsDto, user: any) {
		const subscriptions = new Subscriptions(
			null,
			dto.begin_date,
			dto.end_date,
			dto.planId,
			dto.companyId,
			true,
			undefined,
			user.user_id, // 🔥 siempre del token
		);

		return this.repository.create(subscriptions);
	}

}
