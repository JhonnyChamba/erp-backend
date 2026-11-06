import { UsersRepository } from "../../domain/repositories/users.repository";
import { PasswordService } from "src/common/password/password.service";
import { UpdateUsersDto } from "../dto/update-users.dto";
export declare class UpdateUsersUseCase {
    private readonly repository;
    private readonly passwordService;
    constructor(repository: UsersRepository, passwordService: PasswordService);
    execute(id: number, companyId: number, dto: UpdateUsersDto, currentUser?: any): Promise<import("../../domain/entities/users.entity").Users>;
}
