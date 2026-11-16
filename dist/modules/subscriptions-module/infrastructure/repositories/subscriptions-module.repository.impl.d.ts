import { SubscriptionsModuleRepository } from '../../domain/repositories/subscriptions-module.repository';
import { SubscriptionsModuleOrmEntity } from '../persistence/subscriptions-module.orm-entity';
import { SubscriptionsModule } from '../../domain/entities/subscriptions-module.entity';
import { Repository } from 'typeorm';
export declare class SubscriptionsModuleRepositoryImpl implements SubscriptionsModuleRepository {
    private readonly repo;
    constructor(repo: Repository<SubscriptionsModuleOrmEntity>);
    create(subModule: SubscriptionsModule): Promise<SubscriptionsModule>;
    findByCompany(subscriptionId: number, page: number, limit: number): Promise<{
        data: SubscriptionsModule[];
        total: number;
    }>;
    findById(id: number, subscriptionId: number): Promise<SubscriptionsModule | null>;
    update(subModule: SubscriptionsModule): Promise<SubscriptionsModule>;
    private toDomain;
}
