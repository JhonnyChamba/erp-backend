import { RolesRepository } from "../../domain/repositories/roles.repository";
export declare class GetRolesUseCase {
    private readonly repository;
    constructor(repository: RolesRepository);
    execute(id: number, companyId: number): Promise<import("../../domain/entities/roles.entity").Roles>;
}
