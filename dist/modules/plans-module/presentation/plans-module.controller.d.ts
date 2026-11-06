import { CreatePlansModulesUseCase } from "../application/use-cases/create-plans-module.use-case";
import { UpdatePlansModulesUseCase } from "../application/use-cases/update-plans-module.use-case";
import { ListPlansModulesUseCase } from "../application/use-cases/list-plans-module.use-case";
import { GetPlansModulesUseCase } from "../application/use-cases/get-plans-module.use-case";
import { CreatePlansModulesDto } from "../application/dto/create-plans-module.dto";
import { UpdatePlansModulesDto } from "../application/dto/update-plans-module.dto";
import { ListPlansModulesDto } from "../application/dto/list-plans-module.dto";
export declare class PlansModulesController {
    private readonly createUseCase;
    private readonly listUseCase;
    private readonly getUseCase;
    private readonly updateUseCase;
    constructor(createUseCase: CreatePlansModulesUseCase, listUseCase: ListPlansModulesUseCase, getUseCase: GetPlansModulesUseCase, updateUseCase: UpdatePlansModulesUseCase);
    create(dto: CreatePlansModulesDto, req: any): Promise<import("../domain/entities/plans-module.entity").PlansModules>;
    list(query: ListPlansModulesDto, req: any): Promise<{
        data: import("../domain/entities/plans-module.entity").PlansModules[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    get(id: number, req: any): Promise<import("../domain/entities/plans-module.entity").PlansModules>;
    update(id: number, dto: UpdatePlansModulesDto, req: any): Promise<import("../domain/entities/plans-module.entity").PlansModules>;
}
