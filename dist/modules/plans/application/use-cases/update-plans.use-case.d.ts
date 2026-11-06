import { PlansRepository } from "../../domain/repositories/plans.repository";
export declare class UpdatePlansUseCase {
    private readonly repository;
    constructor(repository: PlansRepository);
    execute(id: number, dto: any): Promise<import("../../domain/entities/plans.entity").Plans>;
}
