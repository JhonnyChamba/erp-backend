import { PlansRepository } from '../../domain/repositories/plans.repository';
import { Plans } from '../../domain/entities/plans.entity';
import { CreatePlansDto } from '../dto/create-plans.dto';
export declare class CreatePlansUseCase {
    private readonly repository;
    constructor(repository: PlansRepository);
    execute(dto: CreatePlansDto, user: any): Promise<Plans>;
}
