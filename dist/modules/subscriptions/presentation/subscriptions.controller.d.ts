import { CreateSubscriptionsUseCase } from "../application/use-cases/create-subscriptions.use-case";
import { UpdateSubscriptionsUseCase } from "../application/use-cases/update-subscriptions.use-case";
import { ListSubscriptionsUseCase } from "../application/use-cases/list-subscriptions.use-case";
import { GetSubscriptionsUseCase } from "../application/use-cases/get-subscriptions.use-case";
import { CreateSubscriptionsDto } from "../application/dto/create-subscriptions.dto";
import { UpdateSubscriptionsDto } from "../application/dto/update-subscriptions.dto";
import { ListSubscriptionsDto } from "../application/dto/list-subscriptions.dto";
export declare class SubscriptionsController {
    private readonly createUseCase;
    private readonly listUseCase;
    private readonly getUseCase;
    private readonly updateUseCase;
    constructor(createUseCase: CreateSubscriptionsUseCase, listUseCase: ListSubscriptionsUseCase, getUseCase: GetSubscriptionsUseCase, updateUseCase: UpdateSubscriptionsUseCase);
    create(dto: CreateSubscriptionsDto, req: any): Promise<import("../domain/entities/subscriptions.entity").Subscriptions>;
    list(query: ListSubscriptionsDto, req: any): Promise<{
        data: import("../domain/entities/subscriptions.entity").Subscriptions[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    get(id: number, req: any): Promise<import("../domain/entities/subscriptions.entity").Subscriptions>;
    update(id: number, dto: UpdateSubscriptionsDto, req: any): Promise<import("../domain/entities/subscriptions.entity").Subscriptions>;
}
