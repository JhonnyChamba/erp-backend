import { BranchCompanyRepository } from "../../domain/repositories/branch-company.repository";
export declare class UpdateBranchCompanyUseCase {
    private readonly repository;
    constructor(repository: BranchCompanyRepository);
    execute(id: number, companyId: number, dto: any): Promise<import("../../domain/entities/branch-company.entity").BranchCompany>;
}
