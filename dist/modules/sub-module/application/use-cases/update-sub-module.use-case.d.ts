import { subModulesRepository } from "../../domain/repositories/sub-module.repository";
export declare class UpdatesubModulesUseCase {
    private readonly repository;
    constructor(repository: subModulesRepository);
    execute(id: number, moduleId: number, dto: any): Promise<import("../../domain/entities/sub-module.entity").subModules>;
}
