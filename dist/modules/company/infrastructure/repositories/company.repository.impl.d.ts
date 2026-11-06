import { CompanyRepository } from '../../domain/repositories/company.repository';
import { CompanyOrmEntity } from '../persistence/company.orm-entity';
import { Company } from '../../domain/entities/company.entity';
import { Repository } from 'typeorm';
export declare class CompanyRepositoryImpl implements CompanyRepository {
    private readonly repo;
    constructor(repo: Repository<CompanyOrmEntity>);
    create(company: Company): Promise<Company>;
    findByCompany(page: number, limit: number): Promise<{
        data: Company[];
        total: number;
    }>;
    findById(id: number): Promise<Company | null>;
    update(company: Company): Promise<Company>;
    private toDomain;
}
