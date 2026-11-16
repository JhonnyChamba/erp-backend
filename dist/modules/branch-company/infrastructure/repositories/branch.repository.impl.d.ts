import { BranchCompanyRepository } from '../../domain/repositories/branch-company.repository';
import { BranchCompanyOrmEntity } from '../persistence/branch-company.orm-entity';
import { BranchCompany } from '../../domain/entities/branch-company.entity';
import { Repository } from 'typeorm';
export declare class BranchCompanyRepositoryImpl implements BranchCompanyRepository {
    private readonly repo;
    constructor(repo: Repository<BranchCompanyOrmEntity>);
    create(branch: BranchCompany): Promise<BranchCompany>;
    findByCompany(companyId: number, page: number, limit: number, onlyEnabled?: boolean): Promise<{
        data: BranchCompany[];
        total: number;
    }>;
    findById(id: number, companyId: number): Promise<BranchCompany | null>;
    findByCode(companyId: number, code: string): Promise<BranchCompany | null>;
    countByCompany(companyId: number): Promise<number>;
    findMatrix(companyId: number): Promise<BranchCompany | null>;
    setMatrix(companyId: number, id: number): Promise<void>;
    update(branch: BranchCompany): Promise<BranchCompany>;
    softDelete(id: number, companyId: number): Promise<void>;
    private toDomain;
}
