import { CreateCompanyUseCase } from "../application/use-cases/create-company.use-case";
import { UpdateCompanyUseCase } from "../application/use-cases/update-company.use-case";
import { ListCompanyUseCase } from "../application/use-cases/list-company.use-case";
import { GetCompanyUseCase } from "../application/use-cases/get-company.use-case";
import { CreateCompanyDto } from "../application/dto/create-company.dto";
import { UpdateCompanyDto } from "../application/dto/update-company.dto";
import { ListCompanyDto } from "../application/dto/list-company.dto";
export declare class CompanyController {
    private readonly createUseCase;
    private readonly listUseCase;
    private readonly getUseCase;
    private readonly updateUseCase;
    constructor(createUseCase: CreateCompanyUseCase, listUseCase: ListCompanyUseCase, getUseCase: GetCompanyUseCase, updateUseCase: UpdateCompanyUseCase);
    create(dto: CreateCompanyDto, req: any): Promise<import("../domain/entities/company.entity").Company>;
    list(query: ListCompanyDto, req: any): Promise<{
        data: import("../domain/entities/company.entity").Company[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    get(id: number, req: any): Promise<import("../domain/entities/company.entity").Company>;
    update(id: number, dto: UpdateCompanyDto, req: any): Promise<import("../domain/entities/company.entity").Company>;
}
