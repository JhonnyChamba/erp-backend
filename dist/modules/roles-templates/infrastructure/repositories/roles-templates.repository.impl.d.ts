import { RolesTemplatesRepository } from '../../domain/repositories/roles-templates.repository';
import { RolesTemplatesOrmEntity } from '../persistence/roles-templates.orm-entity';
import { RolesTemplates } from '../../domain/entities/roles-templates.entity';
import { Repository } from 'typeorm';
export declare class RolesTemplatesRepositoryImpl implements RolesTemplatesRepository {
    private readonly repo;
    constructor(repo: Repository<RolesTemplatesOrmEntity>);
    create(rolesTemplates: RolesTemplates): Promise<RolesTemplates>;
    findByCompany(page: number, limit: number): Promise<{
        data: RolesTemplates[];
        total: number;
    }>;
    findById(id: number): Promise<RolesTemplates | null>;
    update(rolesTemplates: RolesTemplates): Promise<RolesTemplates>;
    private toDomain;
}
