import { UsersRepository } from "../../domain/repositories/users.repository";
export declare class FindUserByEmailUseCase {
    private readonly usersRepository;
    constructor(usersRepository: UsersRepository);
    execute(email: string): Promise<import("../../domain/entities/users.entity").Users>;
}
