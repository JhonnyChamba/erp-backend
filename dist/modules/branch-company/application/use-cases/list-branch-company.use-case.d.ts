import { BranchCompanyRepository } from "../../domain/repositories/branch-company.repository";
import { ListBranchCompanyDto } from "../dto/list-branch-company.dto";
export declare class ListBranchCompanyUseCase {
    private readonly repository;
    constructor(repository: BranchCompanyRepository);
    execute(dto: ListBranchCompanyDto, user: any): Promise<{
        data: import("../../domain/entities/branch-company.entity").BranchCompany[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
}
