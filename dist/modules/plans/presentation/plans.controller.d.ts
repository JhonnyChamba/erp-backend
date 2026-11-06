import { CreatePlansUseCase } from "../application/use-cases/create-plans.use-case";
import { UpdatePlansUseCase } from "../application/use-cases/update-plans.use-case";
import { ListPlansUseCase } from "../application/use-cases/list-plans.use-case";
import { GetPlansUseCase } from "../application/use-cases/get-plans.use-case";
import { CreatePlansDto } from "../application/dto/create-plans.dto";
import { UpdatePlansDto } from "../application/dto/update-plans.dto";
import { ListPlansDto } from "../application/dto/list-plans.dto";
export declare class PlansController {
    private readonly createUseCase;
    private readonly listUseCase;
    private readonly getUseCase;
    private readonly updateUseCase;
    constructor(createUseCase: CreatePlansUseCase, listUseCase: ListPlansUseCase, getUseCase: GetPlansUseCase, updateUseCase: UpdatePlansUseCase);
    create(dto: CreatePlansDto, req: any): Promise<import("../domain/entities/plans.entity").Plans>;
    list(query: ListPlansDto, req: any): Promise<{
        data: import("../domain/entities/plans.entity").Plans[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    get(id: number, req: any): Promise<import("../domain/entities/plans.entity").Plans>;
    update(id: number, dto: UpdatePlansDto, req: any): Promise<import("../domain/entities/plans.entity").Plans>;
}
