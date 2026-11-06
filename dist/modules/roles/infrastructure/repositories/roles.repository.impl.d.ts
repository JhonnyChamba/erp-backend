import { RolesRepository } from '../../domain/repositories/roles.repository';
import { RolesOrmEntity } from '../persistence/roles.orm-entity';
import { Roles } from '../../domain/entities/roles.entity';
import { Repository } from 'typeorm';
export declare class RolesRepositoryImpl implements RolesRepository {
    private readonly repo;
    constructor(repo: Repository<RolesOrmEntity>);
    create(roles: Roles): Promise<Roles>;
    findByCompany(companyId: number, page: number, limit: number): Promise<{
        data: Roles[];
        total: number;
    }>;
    findById(id: number, companyId: number): Promise<Roles | null>;
    update(roles: Roles): Promise<Roles>;
    private toDomain;
}
