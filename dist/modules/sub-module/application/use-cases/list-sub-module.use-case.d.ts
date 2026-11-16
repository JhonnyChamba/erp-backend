import { subModulesRepository } from "../../domain/repositories/sub-module.repository";
import { ListsubModulesDto } from "../dto/list-sub-module.dto";
export declare class ListsubModulesUseCase {
    private readonly repository;
    constructor(repository: subModulesRepository);
    execute(dto: ListsubModulesDto, user: any): Promise<{
        data: import("../../domain/entities/sub-module.entity").subModules[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
}
