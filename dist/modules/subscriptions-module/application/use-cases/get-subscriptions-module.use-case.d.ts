import { SubscriptionsModuleRepository } from "../../domain/repositories/subscriptions-module.repository";
export declare class GetSubscriptionsModuleUseCase {
    private readonly repository;
    constructor(repository: SubscriptionsModuleRepository);
    execute(id: number, subscriptionId: number): Promise<import("../../domain/entities/subscriptions-module.entity").SubscriptionsModule>;
}
