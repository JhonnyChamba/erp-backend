import { CreateUserCompanyUseCase } from "../application/use-cases/create-user-company.use-case";
import { UpdateUserCompanyUseCase } from "../application/use-cases/update-user-company.use-case";
import { ListUserCompanyUseCase } from "../application/use-cases/list-user-company.use-case";
import { GetUserCompanyUseCase } from "../application/use-cases/get-user-company.use-case";
import { CreateUserCompanyDto } from "../application/dto/create-user-company.dto";
import { UpdateUserCompanyDto } from "../application/dto/update-user-company.dto";
import { ListUserCompanyDto } from "../application/dto/list-user-company.dto";
export declare class UserCompanyController {
    private readonly createUseCase;
    private readonly listUseCase;
    private readonly getUseCase;
    private readonly updateUseCase;
    constructor(createUseCase: CreateUserCompanyUseCase, listUseCase: ListUserCompanyUseCase, getUseCase: GetUserCompanyUseCase, updateUseCase: UpdateUserCompanyUseCase);
    create(dto: CreateUserCompanyDto, req: any): Promise<import("../domain/entities/user-company.entity").UserCompany>;
    list(query: ListUserCompanyDto, req: any): Promise<{
        data: {
            id: number;
            company: import("../../company/infrastructure/persistence/company.orm-entity").CompanyOrmEntity;
            enabled: boolean;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    } | {
        data: import("../domain/entities/user-company.entity").UserCompany[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    get(id: number, req: any): Promise<import("../domain/entities/user-company.entity").UserCompany>;
    update(id: number, dto: UpdateUserCompanyDto, req: any): Promise<import("../domain/entities/user-company.entity").UserCompany>;
}
