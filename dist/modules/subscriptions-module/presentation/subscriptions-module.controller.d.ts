import { CreateSubscriptionsModuleUseCase } from "../application/use-cases/create-subscriptions-module.use-case";
import { UpdateSubscriptionsModuleUseCase } from "../application/use-cases/update-subscriptions-module.use-case";
import { ListSubscriptionsModuleUseCase } from "../application/use-cases/list-subscriptions-module.use-case";
import { GetSubscriptionsModuleUseCase } from "../application/use-cases/get-subscriptions-module.use-case";
import { CreateSubscriptionsModuleDto } from "../application/dto/create-subscriptions-module.dto";
import { UpdateSubscriptionsModuleDto } from "../application/dto/update-subscriptions-module.dto";
import { ListSubscriptionsModuleDto } from "../application/dto/list-subscriptions-module.dto";
export declare class SubscriptionsModuleController {
    private readonly createUseCase;
    private readonly listUseCase;
    private readonly getUseCase;
    private readonly updateUseCase;
    constructor(createUseCase: CreateSubscriptionsModuleUseCase, listUseCase: ListSubscriptionsModuleUseCase, getUseCase: GetSubscriptionsModuleUseCase, updateUseCase: UpdateSubscriptionsModuleUseCase);
    create(dto: CreateSubscriptionsModuleDto, req: any): Promise<import("../domain/entities/subscriptions-module.entity").SubscriptionsModule>;
    list(query: ListSubscriptionsModuleDto, req: any): Promise<{
        data: import("../domain/entities/subscriptions-module.entity").SubscriptionsModule[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    get(id: number, req: any): Promise<import("../domain/entities/subscriptions-module.entity").SubscriptionsModule>;
    update(id: number, dto: UpdateSubscriptionsModuleDto, req: any): Promise<import("../domain/entities/subscriptions-module.entity").SubscriptionsModule>;
}
