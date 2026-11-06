import { RolesRepository } from '../../domain/repositories/roles.repository';
import { Roles } from '../../domain/entities/roles.entity';
import { CreateRolesDto } from '../dto/create-roles.dto';
export declare class CreateRolesUseCase {
    private readonly repository;
    constructor(repository: RolesRepository);
    execute(dto: CreateRolesDto, user: any): Promise<Roles>;
}
