import { UsersRepository } from "../../domain/repositories/users.repository";
import { ListUsersDto } from "../dto/list-users.dto";
export declare class ListUsersUseCase {
    private readonly repository;
    constructor(repository: UsersRepository);
    execute(dto: ListUsersDto, user: any): Promise<{
        data: import("../../domain/entities/users.entity").Users[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
}
