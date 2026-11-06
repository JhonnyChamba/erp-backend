import { UserCompanyRepository } from "../../domain/repositories/user-company.repository";
export declare class GetUserCompanyUseCase {
    private readonly repository;
    constructor(repository: UserCompanyRepository);
    execute(id: number, UserCompany: number): Promise<import("../../domain/entities/user-company.entity").UserCompany>;
}
