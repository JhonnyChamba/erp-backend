import { CreateBranchCompanyUseCase } from "../application/use-cases/create-branch-company.use-case";
import { UpdateBranchCompanyUseCase } from "../application/use-cases/update-branch-company.use-case";
import { SetMatrixBranchCompanyUseCase } from "../application/use-cases/set-matrix-branch-company.use-case";
import { DeleteBranchCompanyUseCase } from "../application/use-cases/delete-branch-company.use-case";
import { ListBranchCompanyUseCase } from "../application/use-cases/list-branch-company.use-case";
import { GetBranchCompanyUseCase } from "../application/use-cases/get-branch-company.use-case";
import { CreateBranchCompanyDto } from "../application/dto/create-branch-company.dto";
import { UpdateBranchCompanyDto } from "../application/dto/update-branch-company.dto";
import { ListBranchCompanyDto } from "../application/dto/list-branch-company.dto";
export declare class BranchCompanyController {
    private readonly createUseCase;
    private readonly listUseCase;
    private readonly getUseCase;
    private readonly updateUseCase;
    private readonly deleteUseCase;
    private readonly setMatrixUseCase;
    constructor(createUseCase: CreateBranchCompanyUseCase, listUseCase: ListBranchCompanyUseCase, getUseCase: GetBranchCompanyUseCase, updateUseCase: UpdateBranchCompanyUseCase, deleteUseCase: DeleteBranchCompanyUseCase, setMatrixUseCase: SetMatrixBranchCompanyUseCase);
    create(dto: CreateBranchCompanyDto, req: any): Promise<import("../domain/entities/branch-company.entity").BranchCompany>;
    list(query: ListBranchCompanyDto, req: any): Promise<{
        data: import("../domain/entities/branch-company.entity").BranchCompany[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    get(id: number, queryCompanyId: number, req: any): Promise<import("../domain/entities/branch-company.entity").BranchCompany>;
    update(id: number, dto: UpdateBranchCompanyDto, req: any): Promise<import("../domain/entities/branch-company.entity").BranchCompany>;
    setMatrix(id: number, req: any): Promise<import("../domain/entities/branch-company.entity").BranchCompany>;
    remove(id: number, req: any): Promise<{
        success: boolean;
    }>;
}
