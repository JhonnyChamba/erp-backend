import { UsersRepository } from "../../domain/repositories/users.repository";
export declare class GetUsersUseCase {
    private readonly repository;
    constructor(repository: UsersRepository);
    execute(id: number, companyId: number): Promise<import("../../domain/entities/users.entity").Users>;
}
