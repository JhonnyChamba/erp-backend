import { PlansModulesRepository } from "../../domain/repositories/plans-module.repository";
export declare class UpdatePlansModulesUseCase {
    private readonly repository;
    constructor(repository: PlansModulesRepository);
    execute(id: number, planId: number, dto: any): Promise<import("../../domain/entities/plans-module.entity").PlansModules>;
}
