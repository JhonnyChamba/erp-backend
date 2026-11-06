import { RolesRepository } from "../../domain/repositories/roles.repository";
import { ListRolesDto } from "../dto/list-roles.dto";
export declare class ListRolesUseCase {
    private readonly repository;
    constructor(repository: RolesRepository);
    execute(dto: ListRolesDto, user: any): Promise<{
        data: import("../../domain/entities/roles.entity").Roles[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
}
