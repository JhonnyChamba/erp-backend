import { BranchCompanyRepository } from "../../domain/repositories/branch-company.repository";
export declare class DeleteBranchCompanyUseCase {
    private readonly repository;
    constructor(repository: BranchCompanyRepository);
    execute(id: number, companyId: number): Promise<{
        success: boolean;
    }>;
}
