import { Subscriptions } from "../entities/subscriptions.entity";
export declare abstract class SubscriptionsRepository {
    abstract create(subscriptions: Subscriptions): Promise<Subscriptions>;
    abstract findByCompany(companyId: number, page: number, limit: number): Promise<{
        data: Subscriptions[];
        total: number;
    }>;
    abstract findById(id: number, companyId: number): Promise<Subscriptions | null>;
    abstract update(subscriptions: Subscriptions): Promise<Subscriptions>;
}
