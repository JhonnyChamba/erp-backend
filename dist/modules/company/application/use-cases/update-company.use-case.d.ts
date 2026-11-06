import { CompanyRepository } from "../../domain/repositories/company.repository";
export declare class UpdateCompanyUseCase {
    private readonly repository;
    constructor(repository: CompanyRepository);
    execute(id: number, dto: any): Promise<import("../../domain/entities/company.entity").Company>;
}
