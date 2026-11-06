import { UserCompanyRepository } from "../../domain/repositories/user-company.repository";
import { ListUserCompanyDto } from "../dto/list-user-company.dto";
import { Repository } from "typeorm";
import { CompanyOrmEntity } from "src/modules/company/infrastructure/persistence/company.orm-entity";
export declare class ListUserCompanyUseCase {
    private readonly repository;
    private readonly companyRepo;
    constructor(repository: UserCompanyRepository, companyRepo: Repository<CompanyOrmEntity>);
    execute(dto: ListUserCompanyDto, user: any): Promise<{
        data: {
            id: number;
            company: CompanyOrmEntity;
            enabled: boolean;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    } | {
        data: import("../../domain/entities/user-company.entity").UserCompany[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
}
