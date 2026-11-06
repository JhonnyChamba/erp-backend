import { ModuleRepository } from '../../domain/repositories/module.repository';
import { ModuleOrmEntity } from '../persistence/module.orm-entity';
import { Module } from '../../domain/entities/module.entity';
import { Repository } from 'typeorm';
export declare class ModuleRepositoryImpl implements ModuleRepository {
    private readonly repo;
    constructor(repo: Repository<ModuleOrmEntity>);
    create(modules: Module): Promise<Module>;
    findByCompany(page: number, limit: number): Promise<{
        data: Module[];
        total: number;
    }>;
    findById(id: number): Promise<Module | null>;
    update(modules: Module): Promise<Module>;
    private toDomain;
}
