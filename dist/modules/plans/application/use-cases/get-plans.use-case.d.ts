import { PlansRepository } from "../../domain/repositories/plans.repository";
export declare class GetPlansUseCase {
    private readonly repository;
    constructor(repository: PlansRepository);
    execute(id: number): Promise<import("../../domain/entities/plans.entity").Plans>;
}
