import { PermissionsTemplatesRepository } from "../../domain/repositories/permissions-templates.repository";
export declare class UpdatePermissionsTemplatesUseCase {
    private readonly repository;
    constructor(repository: PermissionsTemplatesRepository);
    execute(id: number, dto: any): Promise<import("../../domain/entities/permissions-templates.entity").PermissionsTemplates>;
}
