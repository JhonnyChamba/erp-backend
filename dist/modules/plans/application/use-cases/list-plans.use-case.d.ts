import { PlansRepository } from "../../domain/repositories/plans.repository";
import { ListPlansDto } from "../dto/list-plans.dto";
export declare class ListPlansUseCase {
    private readonly repository;
    constructor(repository: PlansRepository);
    execute(dto: ListPlansDto, user: any): Promise<{
        data: import("../../domain/entities/plans.entity").Plans[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
}
