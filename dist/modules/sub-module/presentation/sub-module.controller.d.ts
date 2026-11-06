import { CreatesubModulesUseCase } from "../application/use-cases/create-sub-module.use-case";
import { UpdatesubModulesUseCase } from "../application/use-cases/update-sub-module.use-case";
import { ListsubModulesUseCase } from "../application/use-cases/list-sub-module.use-case";
import { GetsubModulesUseCase } from "../application/use-cases/get-sub-module.use-case";
import { CreatesubModulesDto } from "../application/dto/create-sub-module.dto";
import { UpdatesubModulesDto } from "../application/dto/update-sub-module.dto";
import { ListsubModulesDto } from "../application/dto/list-sub-module.dto";
export declare class subModulesController {
    private readonly createUseCase;
    private readonly listUseCase;
    private readonly getUseCase;
    private readonly updateUseCase;
    constructor(createUseCase: CreatesubModulesUseCase, listUseCase: ListsubModulesUseCase, getUseCase: GetsubModulesUseCase, updateUseCase: UpdatesubModulesUseCase);
    create(dto: CreatesubModulesDto, req: any): Promise<import("../domain/entities/sub-module.entity").subModules>;
    list(query: ListsubModulesDto, req: any): Promise<{
        data: import("../domain/entities/sub-module.entity").subModules[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    get(id: number, req: any): Promise<import("../domain/entities/sub-module.entity").subModules>;
    update(id: number, dto: UpdatesubModulesDto, req: any): Promise<import("../domain/entities/sub-module.entity").subModules>;
}
