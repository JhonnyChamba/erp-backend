import { ModuleRepository } from "../../domain/repositories/module.repository";
export declare class UpdateModuleUseCase {
    private readonly repository;
    constructor(repository: ModuleRepository);
    execute(id: number, dto: any): Promise<import("../../domain/entities/module.entity").Module>;
}
