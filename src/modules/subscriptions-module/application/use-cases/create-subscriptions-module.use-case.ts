import { SubscriptionsModuleRepository } from '../../domain/repositories/subscriptions-module.repository';
import { SubscriptionsModule } from '../../domain/entities/subscriptions-module.entity';
import { CreateSubscriptionsModuleDto } from '../dto/create-subscriptions-module.dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CreateSubscriptionsModuleUseCase {
	constructor(private readonly repository: SubscriptionsModuleRepository) { }

	async execute(dto: CreateSubscriptionsModuleDto, user: any) {
		const subModule = new SubscriptionsModule(
			null,
			dto.subscriptionId,
			dto.moduleId,
		);

		return this.repository.create(subModule);
	}
}