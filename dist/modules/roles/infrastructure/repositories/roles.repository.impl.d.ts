import { RolesRepository } from '../../domain/repositories/roles.repository';
import { RolesOrmEntity, RoleModuleOrmEntity } from '../persistence/roles.orm-entity';
import { Roles } from '../../domain/entities/roles.entity';
import { Repository } from 'typeorm';
export declare class RolesRepositoryImpl implements RolesRepository {
    private readonly repo;
    private readonly roleModuleRepo;
    constructor(repo: Repository<RolesOrmEntity>, roleModuleRepo: Repository<RoleModuleOrmEntity>);
    create(roles: Roles): Promise<Roles>;
    private generateNextCode;
    findByCompany(companyId: number, page: number, limit: number): Promise<{
        data: Roles[];
        total: number;
    }>;
    findById(id: number, companyId?: number): Promise<Roles | null>;
    update(roles: Roles): Promise<Roles>;
    private syncRoleAccess;
    private toDomain;
}
