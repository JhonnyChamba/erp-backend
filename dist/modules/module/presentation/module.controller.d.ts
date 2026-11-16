import { CreateModuleUseCase } from "../application/use-cases/create-module.use-case";
import { UpdateModuleUseCase } from "../application/use-cases/update-module.use-case";
import { ListModuleUseCase } from "../application/use-cases/list-module.use-case";
import { GetModuleUseCase } from "../application/use-cases/get-module.use-case";
import { CreateModuleDto } from "../application/dto/create-module.dto";
import { UpdateModuleDto } from "../application/dto/update-module.dto";
import { ListModuleDto } from "../application/dto/list-module.dto";
export declare class ModuleController {
    private readonly createUseCase;
    private readonly listUseCase;
    private readonly getUseCase;
    private readonly updateUseCase;
    constructor(createUseCase: CreateModuleUseCase, listUseCase: ListModuleUseCase, getUseCase: GetModuleUseCase, updateUseCase: UpdateModuleUseCase);
    create(dto: CreateModuleDto, req: any): Promise<import("../domain/entities/module.entity").Module>;
    list(query: ListModuleDto, req: any): Promise<{
        data: import("../domain/entities/module.entity").Module[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    get(id: number, req: any): Promise<import("../domain/entities/module.entity").Module>;
    update(id: number, dto: UpdateModuleDto, req: any): Promise<import("../domain/entities/module.entity").Module>;
}
