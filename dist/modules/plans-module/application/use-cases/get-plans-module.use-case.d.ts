import { PlansModulesRepository } from "../../domain/repositories/plans-module.repository";
export declare class GetPlansModulesUseCase {
    private readonly repository;
    constructor(repository: PlansModulesRepository);
    execute(id: number, planId: number): Promise<import("../../domain/entities/plans-module.entity").PlansModules>;
}
