import { subModulesRepository } from "../../domain/repositories/sub-module.repository";
export declare class GetsubModulesUseCase {
    private readonly repository;
    constructor(repository: subModulesRepository);
    execute(id: number, moduleId: number): Promise<import("../../domain/entities/sub-module.entity").subModules>;
}
