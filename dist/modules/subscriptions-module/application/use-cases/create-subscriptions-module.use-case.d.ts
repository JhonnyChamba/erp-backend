import { SubscriptionsModuleRepository } from '../../domain/repositories/subscriptions-module.repository';
import { SubscriptionsModule } from '../../domain/entities/subscriptions-module.entity';
import { CreateSubscriptionsModuleDto } from '../dto/create-subscriptions-module.dto';
export declare class CreateSubscriptionsModuleUseCase {
    private readonly repository;
    constructor(repository: SubscriptionsModuleRepository);
    execute(dto: CreateSubscriptionsModuleDto, user: any): Promise<SubscriptionsModule>;
}
