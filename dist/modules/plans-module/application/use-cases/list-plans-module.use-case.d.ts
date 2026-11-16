import { PlansModulesRepository } from "../../domain/repositories/plans-module.repository";
import { ListPlansModulesDto } from "../dto/list-plans-module.dto";
export declare class ListPlansModulesUseCase {
    private readonly repository;
    constructor(repository: PlansModulesRepository);
    execute(dto: ListPlansModulesDto, user: any): Promise<{
        data: import("../../domain/entities/plans-module.entity").PlansModules[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
}
