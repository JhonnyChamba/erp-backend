import { subModulesRepository } from '../../domain/repositories/sub-module.repository';
import { subModules } from '../../domain/entities/sub-module.entity';
import { CreatesubModulesDto } from '../dto/create-sub-module.dto';
export declare class CreatesubModulesUseCase {
    private readonly repository;
    constructor(repository: subModulesRepository);
    execute(dto: CreatesubModulesDto, user: any): Promise<subModules>;
}
