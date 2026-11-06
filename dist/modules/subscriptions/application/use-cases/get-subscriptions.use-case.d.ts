import { SubscriptionsRepository } from "../../domain/repositories/subscriptions.repository";
export declare class GetSubscriptionsUseCase {
    private readonly repository;
    constructor(repository: SubscriptionsRepository);
    execute(id: number, companyId: number): Promise<import("../../domain/entities/subscriptions.entity").Subscriptions>;
}
