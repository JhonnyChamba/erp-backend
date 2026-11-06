import { CompanyRepository } from "../../domain/repositories/company.repository";
import { ListCompanyDto } from "../dto/list-company.dto";
export declare class ListCompanyUseCase {
    private readonly repository;
    constructor(repository: CompanyRepository);
    execute(dto: ListCompanyDto, user: any): Promise<{
        data: import("../../domain/entities/company.entity").Company[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
}
