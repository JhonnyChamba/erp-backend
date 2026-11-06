import { RolesRepository } from "../../domain/repositories/roles.repository";
export declare class UpdateRolesUseCase {
    private readonly repository;
    constructor(repository: RolesRepository);
    execute(id: number, companyId: number, dto: any): Promise<import("../../domain/entities/roles.entity").Roles>;
}
