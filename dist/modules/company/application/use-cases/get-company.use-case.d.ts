import { CompanyRepository } from "../../domain/repositories/company.repository";
export declare class GetCompanyUseCase {
    private readonly repository;
    constructor(repository: CompanyRepository);
    execute(id: number): Promise<import("../../domain/entities/company.entity").Company>;
}
