import { subModulesRepository } from '../../domain/repositories/sub-module.repository';
import { subModulesOrmEntity } from '../persistence/sub-module.orm-entity';
import { subModules } from '../../domain/entities/sub-module.entity';
import { Repository } from 'typeorm';
export declare class subModulesRepositoryImpl implements subModulesRepository {
    private readonly repo;
    constructor(repo: Repository<subModulesOrmEntity>);
    create(subModule: subModules): Promise<subModules>;
    findByCompany(moduleId: number, page: number, limit: number): Promise<{
        data: subModules[];
        total: number;
    }>;
    findById(id: number, moduleId: number): Promise<subModules | null>;
    update(subModule: subModules): Promise<subModules>;
    private toDomain;
}
