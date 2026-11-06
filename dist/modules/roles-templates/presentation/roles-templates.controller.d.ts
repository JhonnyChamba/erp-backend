import { CreateRolesTemplatesUseCase } from "../application/use-cases/create-roles-templates.use-case";
import { UpdateRolesTemplatesUseCase } from "../application/use-cases/update-roles-templates.use-case";
import { ListRolesTemplatesUseCase } from "../application/use-cases/list-roles-templates.use-case";
import { GetRolesTemplatesUseCase } from "../application/use-cases/get-roles-templates.use-case";
import { CreateRolesTemplatesDto } from "../application/dto/create-roles-templates.dto";
import { UpdateRolesTemplatesDto } from "../application/dto/update-roles-templates.dto";
import { ListRolesTemplatesDto } from "../application/dto/list-roles-templates.dto";
export declare class RolesTemplatesController {
    private readonly createUseCase;
    private readonly listUseCase;
    private readonly getUseCase;
    private readonly updateUseCase;
    constructor(createUseCase: CreateRolesTemplatesUseCase, listUseCase: ListRolesTemplatesUseCase, getUseCase: GetRolesTemplatesUseCase, updateUseCase: UpdateRolesTemplatesUseCase);
    create(dto: CreateRolesTemplatesDto, req: any): Promise<import("../domain/entities/roles-templates.entity").RolesTemplates>;
    list(query: ListRolesTemplatesDto, req: any): Promise<{
        data: import("../domain/entities/roles-templates.entity").RolesTemplates[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    get(id: number, req: any): Promise<import("../domain/entities/roles-templates.entity").RolesTemplates>;
    update(id: number, dto: UpdateRolesTemplatesDto, req: any): Promise<import("../domain/entities/roles-templates.entity").RolesTemplates>;
}
