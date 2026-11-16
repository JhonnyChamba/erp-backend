import { CompanyRepository } from "../../domain/repositories/company.repository";
import { ListCompanyDto } from "../dto/list-company.dto";
import { AccessControlService } from "src/auth/access-control.service";
export declare class ListCompanyUseCase {
    private readonly repository;
    private readonly accessControlService;
    constructor(repository: CompanyRepository, accessControlService: AccessControlService);
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
