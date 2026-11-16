import { ModuleRepository } from "../../domain/repositories/module.repository";
import { ListModuleDto } from "../dto/list-module.dto";
export declare class ListModuleUseCase {
    private readonly repository;
    constructor(repository: ModuleRepository);
    execute(dto: ListModuleDto, user: any): Promise<{
        data: import("../../domain/entities/module.entity").Module[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
}
