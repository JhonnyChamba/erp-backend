import { ModuleRepository } from "../../domain/repositories/module.repository";
export declare class GetModuleUseCase {
    private readonly repository;
    constructor(repository: ModuleRepository);
    execute(id: number): Promise<import("../../domain/entities/module.entity").Module>;
}
