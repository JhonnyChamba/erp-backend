import { PermissionsTemplatesRepository } from '../../domain/repositories/permissions-templates.repository';
import { PermissionsTemplates } from '../../domain/entities/permissions-templates.entity';
import { CreatePermissionsTemplatesDto } from '../dto/create-permissions-templates.dto';
export declare class CreatePermissionsTemplatesUseCase {
    private readonly repository;
    constructor(repository: PermissionsTemplatesRepository);
    execute(dto: CreatePermissionsTemplatesDto, user: any): Promise<PermissionsTemplates>;
}
