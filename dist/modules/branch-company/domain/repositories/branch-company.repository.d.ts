import { BranchCompany } from "../entities/branch-company.entity";
export declare abstract class BranchCompanyRepository {
    abstract create(branch: BranchCompany): Promise<BranchCompany>;
    abstract findByCompany(companyId: number, page: number, limit: number, onlyEnabled?: boolean): Promise<{
        data: BranchCompany[];
        total: number;
    }>;
    abstract findById(id: number, companyId: number): Promise<BranchCompany | null>;
    abstract findByCode(companyId: number, code: string): Promise<BranchCompany | null>;
    abstract countByCompany(companyId: number): Promise<number>;
    abstract findMatrix(companyId: number): Promise<BranchCompany | null>;
    abstract setMatrix(companyId: number, id: number): Promise<void>;
    abstract update(branch: BranchCompany): Promise<BranchCompany>;
    abstract softDelete(id: number, companyId: number): Promise<void>;
}
