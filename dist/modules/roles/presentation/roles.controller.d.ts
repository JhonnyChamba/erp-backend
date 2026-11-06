import { CreateRolesUseCase } from "../application/use-cases/create-roles.use-case";
import { UpdateRolesUseCase } from "../application/use-cases/update-roles.use-case";
import { ListRolesUseCase } from "../application/use-cases/list-roles.use-case";
import { GetRolesUseCase } from "../application/use-cases/get-roles.use-case";
import { CreateRolesDto } from "../application/dto/create-roles.dto";
import { UpdateRolesDto } from "../application/dto/update-roles.dto";
import { ListRolesDto } from "../application/dto/list-roles.dto";
export declare class RolesController {
    private readonly createUseCase;
    private readonly listUseCase;
    private readonly getUseCase;
    private readonly updateUseCase;
    constructor(createUseCase: CreateRolesUseCase, listUseCase: ListRolesUseCase, getUseCase: GetRolesUseCase, updateUseCase: UpdateRolesUseCase);
    create(dto: CreateRolesDto, req: any): Promise<import("../domain/entities/roles.entity").Roles>;
    list(query: ListRolesDto, req: any): Promise<{
        data: import("../domain/entities/roles.entity").Roles[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    get(id: number, req: any): Promise<import("../domain/entities/roles.entity").Roles>;
    update(id: number, dto: UpdateRolesDto, req: any): Promise<import("../domain/entities/roles.entity").Roles>;
}
