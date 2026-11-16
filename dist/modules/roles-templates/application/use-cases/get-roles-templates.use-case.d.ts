import { RolesTemplatesRepository } from "../../domain/repositories/roles-templates.repository";
export declare class GetRolesTemplatesUseCase {
    private readonly repository;
    constructor(repository: RolesTemplatesRepository);
    execute(id: number): Promise<import("../../domain/entities/roles-templates.entity").RolesTemplates>;
}
