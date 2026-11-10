import { BranchCompany } from "../entities/branch-company.entity";

export abstract class BranchCompanyRepository {
  abstract create(branch: BranchCompany): Promise<BranchCompany>;
  abstract findByCompany(companyId: number, page: number, limit: number, onlyEnabled?: boolean): Promise<{
    data: BranchCompany[];
    total: number;
  }>;
  abstract findById(id: number, companyId: number): Promise<BranchCompany | null>;
  abstract findByCode(companyId: number, code: string): Promise<BranchCompany | null>;
  abstract countByCompany(companyId: number): Promise<number>;
  abstract findMatrix(companyId: number): Promise<BranchCompany | null>;
  /** Cambia la matriz de la empresa en una sola transacción: la anterior deja de serlo y la nueva pasa a serlo. */
  abstract setMatrix(companyId: number, id: number): Promise<void>;
  abstract update(branch: BranchCompany): Promise<BranchCompany>;
  abstract softDelete(id: number, companyId: number): Promise<void>;
}
