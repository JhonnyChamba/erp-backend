import { BranchCompanyRepository } from '../../domain/repositories/branch-company.repository';
import { BranchCompanyOrmEntity } from '../persistence/branch-company.orm-entity';
import { BranchCompany } from '../../domain/entities/branch-company.entity';
import { Repository } from 'typeorm';
export declare class BranchCompanyRepositoryImpl implements BranchCompanyRepository {
    private readonly repo;
    constructor(repo: Repository<BranchCompanyOrmEntity>);
    create(branch: BranchCompany): Promise<BranchCompany>;
    findByCompany(companyId: number, page: number, limit: number): Promise<{
        data: BranchCompany[];
        total: number;
    }>;
    findById(id: number, companyId: number): Promise<BranchCompany | null>;
    update(branch: BranchCompany): Promise<BranchCompany>;
    private toDomain;
}
