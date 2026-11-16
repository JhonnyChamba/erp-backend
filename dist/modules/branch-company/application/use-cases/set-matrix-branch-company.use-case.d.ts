import { BranchCompanyRepository } from "../../domain/repositories/branch-company.repository";
export declare class SetMatrixBranchCompanyUseCase {
    private readonly repository;
    constructor(repository: BranchCompanyRepository);
    execute(id: number, companyId: number): Promise<import("../../domain/entities/branch-company.entity").BranchCompany>;
}
