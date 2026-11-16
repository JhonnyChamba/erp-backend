import { UserCompanyRepository } from '../../domain/repositories/user-company.repository';
import { UserCompanyOrmEntity } from '../persistence/user-company.orm-entity';
import { UserCompany } from '../../domain/entities/user-company.entity';
import { Repository } from 'typeorm';
export declare class UserCompanyRepositoryImpl implements UserCompanyRepository {
    private readonly repo;
    constructor(repo: Repository<UserCompanyOrmEntity>);
    create(company: UserCompany): Promise<UserCompany>;
    findByCompany(usersId: number | undefined, page: number, limit: number): Promise<{
        data: UserCompany[];
        total: number;
    }>;
    findById(id: number, usersId: number): Promise<UserCompany | null>;
    update(company: UserCompany): Promise<UserCompany>;
    private toDomain;
}
