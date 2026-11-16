import { SubscriptionsRepository } from '../../domain/repositories/subscriptions.repository';
import { Subscriptions } from '../../domain/entities/subscriptions.entity';
import { CreateSubscriptionsDto } from '../dto/create-subscriptions.dto';
export declare class CreateSubscriptionsUseCase {
    private readonly repository;
    constructor(repository: SubscriptionsRepository);
    execute(dto: CreateSubscriptionsDto, user: any): Promise<Subscriptions>;
}
