import { SubscriptionsRepository } from "../../domain/repositories/subscriptions.repository";
export declare class UpdateSubscriptionsUseCase {
    private readonly repository;
    constructor(repository: SubscriptionsRepository);
    execute(id: number, companyId: number, dto: any): Promise<import("../../domain/entities/subscriptions.entity").Subscriptions>;
}
