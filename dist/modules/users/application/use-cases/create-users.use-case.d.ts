import { UsersRepository } from '../../domain/repositories/users.repository';
import { Users } from '../../domain/entities/users.entity';
import { CreateUsersDto } from '../dto/create-users.dto';
export declare class CreateUsersUseCase {
    private readonly repository;
    constructor(repository: UsersRepository);
    execute(dto: CreateUsersDto, currentUser?: any): Promise<Users>;
}
