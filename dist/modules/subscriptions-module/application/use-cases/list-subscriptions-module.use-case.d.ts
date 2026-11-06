import { SubscriptionsModuleRepository } from "../../domain/repositories/subscriptions-module.repository";
import { ListSubscriptionsModuleDto } from "../dto/list-subscriptions-module.dto";
export declare class ListSubscriptionsModuleUseCase {
    private readonly repository;
    constructor(repository: SubscriptionsModuleRepository);
    execute(dto: ListSubscriptionsModuleDto, user: any): Promise<{
        data: import("../../domain/entities/subscriptions-module.entity").SubscriptionsModule[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
}
