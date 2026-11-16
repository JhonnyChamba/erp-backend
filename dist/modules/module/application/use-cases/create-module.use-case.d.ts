import { ModuleRepository } from '../../domain/repositories/module.repository';
import { Module } from '../../domain/entities/module.entity';
import { CreateModuleDto } from '../dto/create-module.dto';
export declare class CreateModuleUseCase {
    private readonly repository;
    constructor(repository: ModuleRepository);
    execute(dto: CreateModuleDto, user: any): Promise<Module>;
}
