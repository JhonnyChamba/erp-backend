import { CompanyRepository } from '../../domain/repositories/company.repository';
import { CompanyOrmEntity } from '../persistence/company.orm-entity';
import { RolesOrmEntity, RoleModuleOrmEntity } from 'src/modules/roles/infrastructure/persistence/roles.orm-entity';
import { SubscriptionsOrmEntity } from 'src/modules/subscriptions/infrastructure/persistence/subscriptions.orm-entity';
import { Company } from '../../domain/entities/company.entity';
import { Repository } from 'typeorm';
export declare class CompanyRepositoryImpl implements CompanyRepository {
    private readonly repo;
    private readonly rolesRepo;
    private readonly roleModuleRepo;
    private readonly subscriptionsRepo;
    constructor(repo: Repository<CompanyOrmEntity>, rolesRepo: Repository<RolesOrmEntity>, roleModuleRepo: Repository<RoleModuleOrmEntity>, subscriptionsRepo: Repository<SubscriptionsOrmEntity>);
    private buildExtraColumns;
    create(company: Company): Promise<Company>;
    private ensureDefaultAdminRole;
    findByCompany(page: number, limit: number): Promise<{
        data: Company[];
        total: number;
    }>;
    findById(id: number): Promise<Company | null>;
    update(company: Company): Promise<Company>;
    private toDomain;
}
