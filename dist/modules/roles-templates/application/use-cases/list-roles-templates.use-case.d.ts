import { RolesTemplatesRepository } from "../../domain/repositories/roles-templates.repository";
import { ListRolesTemplatesDto } from "../dto/list-roles-templates.dto";
export declare class ListRolesTemplatesUseCase {
    private readonly repository;
    constructor(repository: RolesTemplatesRepository);
    execute(dto: ListRolesTemplatesDto, user: any): Promise<{
        data: import("../../domain/entities/roles-templates.entity").RolesTemplates[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
}
