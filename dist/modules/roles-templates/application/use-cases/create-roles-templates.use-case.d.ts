import { RolesTemplatesRepository } from '../../domain/repositories/roles-templates.repository';
import { RolesTemplates } from '../../domain/entities/roles-templates.entity';
import { CreateRolesTemplatesDto } from '../dto/create-roles-templates.dto';
export declare class CreateRolesTemplatesUseCase {
    private readonly repository;
    constructor(repository: RolesTemplatesRepository);
    execute(dto: CreateRolesTemplatesDto, user: any): Promise<RolesTemplates>;
}
