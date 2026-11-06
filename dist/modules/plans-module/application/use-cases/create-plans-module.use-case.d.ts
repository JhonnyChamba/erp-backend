import { PlansModulesRepository } from '../../domain/repositories/plans-module.repository';
import { PlansModules } from '../../domain/entities/plans-module.entity';
import { CreatePlansModulesDto } from '../dto/create-plans-module.dto';
export declare class CreatePlansModulesUseCase {
    private readonly repository;
    constructor(repository: PlansModulesRepository);
    execute(dto: CreatePlansModulesDto, user: any): Promise<PlansModules>;
}
