import { PlansModulesRepository } from '../../domain/repositories/plans-module.repository';
import { PlansModulesOrmEntity } from '../persistence/plans-module.orm-entity';
import { PlansModules } from '../../domain/entities/plans-module.entity';
import { Repository } from 'typeorm';
export declare class PlansModulesRepositoryImpl implements PlansModulesRepository {
    private readonly repo;
    constructor(repo: Repository<PlansModulesOrmEntity>);
    create(subModule: PlansModules): Promise<PlansModules>;
    findByCompany(planId: number, page: number, limit: number): Promise<{
        data: PlansModules[];
        total: number;
    }>;
    findById(id: number, planId: number): Promise<PlansModules | null>;
    update(subModule: PlansModules): Promise<PlansModules>;
    private toDomain;
}
