import { PlansRepository } from '../../domain/repositories/plans.repository';
import { PlansOrmEntity } from '../persistence/plans.orm-entity';
import { Plans } from '../../domain/entities/plans.entity';
import { Repository } from 'typeorm';
export declare class PlansRepositoryImpl implements PlansRepository {
    private readonly repo;
    constructor(repo: Repository<PlansOrmEntity>);
    create(company: Plans): Promise<Plans>;
    findByPlans(page: number, limit: number): Promise<{
        data: Plans[];
        total: number;
    }>;
    findById(id: number): Promise<Plans | null>;
    update(company: Plans): Promise<Plans>;
    private toDomain;
}
