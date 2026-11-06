import { SubscriptionsRepository } from '../../domain/repositories/subscriptions.repository';
import { SubscriptionsOrmEntity } from '../persistence/subscriptions.orm-entity';
import { Subscriptions } from '../../domain/entities/subscriptions.entity';
import { Repository } from 'typeorm';
export declare class SubscriptionsRepositoryImpl implements SubscriptionsRepository {
    private readonly repo;
    constructor(repo: Repository<SubscriptionsOrmEntity>);
    create(subscriptions: Subscriptions): Promise<Subscriptions>;
    findByCompany(companyId: number, page: number, limit: number): Promise<{
        data: Subscriptions[];
        total: number;
    }>;
    findById(id: number, companyId: number): Promise<Subscriptions | null>;
    update(subscriptions: Subscriptions): Promise<Subscriptions>;
    private toDomain;
}
