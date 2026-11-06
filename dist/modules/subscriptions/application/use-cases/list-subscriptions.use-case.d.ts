import { SubscriptionsRepository } from "../../domain/repositories/subscriptions.repository";
import { ListSubscriptionsDto } from "../dto/list-subscriptions.dto";
export declare class ListSubscriptionsUseCase {
    private readonly repository;
    constructor(repository: SubscriptionsRepository);
    execute(dto: ListSubscriptionsDto, user: any): Promise<{
        data: import("../../domain/entities/subscriptions.entity").Subscriptions[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
}
