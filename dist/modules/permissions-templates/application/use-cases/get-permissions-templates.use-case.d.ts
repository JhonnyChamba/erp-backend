import { PermissionsTemplatesRepository } from "../../domain/repositories/permissions-templates.repository";
export declare class GetPermissionsTemplatesUseCase {
    private readonly repository;
    constructor(repository: PermissionsTemplatesRepository);
    execute(id: number): Promise<import("../../domain/entities/permissions-templates.entity").PermissionsTemplates>;
}
