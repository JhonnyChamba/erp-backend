import { SubscriptionsModuleRepository } from "../../domain/repositories/subscriptions-module.repository";
export declare class UpdateSubscriptionsModuleUseCase {
    private readonly repository;
    constructor(repository: SubscriptionsModuleRepository);
    execute(id: number, subscriptionId: number, dto: any): Promise<import("../../domain/entities/subscriptions-module.entity").SubscriptionsModule>;
}
