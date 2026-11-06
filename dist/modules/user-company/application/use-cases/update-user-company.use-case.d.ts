import { UserCompanyRepository } from "../../domain/repositories/user-company.repository";
export declare class UpdateUserCompanyUseCase {
    private readonly repository;
    constructor(repository: UserCompanyRepository);
    execute(id: number, usersId: number, dto: any): Promise<import("../../domain/entities/user-company.entity").UserCompany>;
}
