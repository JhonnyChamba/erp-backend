import { CreatePermissionsTemplatesUseCase } from "../application/use-cases/create-permissions-templates.use-case";
import { UpdatePermissionsTemplatesUseCase } from "../application/use-cases/update-permissions-templates.use-case";
import { ListPermissionsTemplatesUseCase } from "../application/use-cases/list-permissions-templates.use-case";
import { GetPermissionsTemplatesUseCase } from "../application/use-cases/get-permissions-templates.use-case";
import { CreatePermissionsTemplatesDto } from "../application/dto/create-permissions-templates.dto";
import { UpdatePermissionsTemplatesDto } from "../application/dto/update-permissions-templates.dto";
import { ListPermissionsTemplatesDto } from "../application/dto/list-permissions-templates.dto";
export declare class PermissionsTemplatesController {
    private readonly createUseCase;
    private readonly listUseCase;
    private readonly getUseCase;
    private readonly updateUseCase;
    constructor(createUseCase: CreatePermissionsTemplatesUseCase, listUseCase: ListPermissionsTemplatesUseCase, getUseCase: GetPermissionsTemplatesUseCase, updateUseCase: UpdatePermissionsTemplatesUseCase);
    create(dto: CreatePermissionsTemplatesDto, req: any): Promise<import("../domain/entities/permissions-templates.entity").PermissionsTemplates>;
    list(query: ListPermissionsTemplatesDto, req: any): Promise<{
        data: import("../domain/entities/permissions-templates.entity").PermissionsTemplates[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    get(id: number, req: any): Promise<import("../domain/entities/permissions-templates.entity").PermissionsTemplates>;
    update(id: number, dto: UpdatePermissionsTemplatesDto, req: any): Promise<import("../domain/entities/permissions-templates.entity").PermissionsTemplates>;
}
