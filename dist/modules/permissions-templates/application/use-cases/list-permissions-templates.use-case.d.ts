import { PermissionsTemplatesRepository } from "../../domain/repositories/permissions-templates.repository";
import { ListPermissionsTemplatesDto } from "../dto/list-permissions-templates.dto";
export declare class ListPermissionsTemplatesUseCase {
    private readonly repository;
    constructor(repository: PermissionsTemplatesRepository);
    execute(dto: ListPermissionsTemplatesDto, user: any): Promise<{
        data: import("../../domain/entities/permissions-templates.entity").PermissionsTemplates[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
}
