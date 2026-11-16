import { RolesTemplatesRepository } from "../../domain/repositories/roles-templates.repository";
export declare class UpdateRolesTemplatesUseCase {
    private readonly repository;
    constructor(repository: RolesTemplatesRepository);
    execute(id: number, dto: any): Promise<import("../../domain/entities/roles-templates.entity").RolesTemplates>;
}
