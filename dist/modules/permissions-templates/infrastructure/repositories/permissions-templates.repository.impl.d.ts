import { PermissionsTemplatesRepository } from '../../domain/repositories/permissions-templates.repository';
import { PermissionsTemplatesOrmEntity } from '../persistence/permissions-templates.orm-entity';
import { PermissionsTemplates } from '../../domain/entities/permissions-templates.entity';
import { Repository } from 'typeorm';
export declare class PermissionsTemplatesRepositoryImpl implements PermissionsTemplatesRepository {
    private readonly repo;
    constructor(repo: Repository<PermissionsTemplatesOrmEntity>);
    create(permissions: PermissionsTemplates): Promise<PermissionsTemplates>;
    findByCompany(page: number, limit: number): Promise<{
        data: PermissionsTemplates[];
        total: number;
    }>;
    findById(id: number): Promise<PermissionsTemplates | null>;
    update(permissions: PermissionsTemplates): Promise<PermissionsTemplates>;
    private toDomain;
}
