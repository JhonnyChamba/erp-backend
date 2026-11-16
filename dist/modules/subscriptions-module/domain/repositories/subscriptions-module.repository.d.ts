import { SubscriptionsModule } from "../entities/subscriptions-module.entity";
export declare abstract class SubscriptionsModuleRepository {
    abstract create(subModule: SubscriptionsModule): Promise<SubscriptionsModule>;
    abstract findByCompany(subscriptionId: number, page: number, limit: number): Promise<{
        data: SubscriptionsModule[];
        total: number;
    }>;
    abstract findById(id: number, subscriptionId: number): Promise<SubscriptionsModule | null>;
    abstract update(subModule: SubscriptionsModule): Promise<SubscriptionsModule>;
}
