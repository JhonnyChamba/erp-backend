import { CreateUsersUseCase } from "../application/use-cases/create-users.use-case";
import { UpdateUsersUseCase } from "../application/use-cases/update-users.use-case";
import { ListUsersUseCase } from "../application/use-cases/list-users.use-case";
import { GetUsersUseCase } from "../application/use-cases/get-users.use-case";
import { CreateUsersDto } from "../application/dto/create-users.dto";
import { UpdateUsersDto } from "../application/dto/update-users.dto";
import { ListUsersDto } from "../application/dto/list-users.dto";
export declare class UsersController {
    private readonly createUseCase;
    private readonly listUseCase;
    private readonly getUseCase;
    private readonly updateUseCase;
    constructor(createUseCase: CreateUsersUseCase, listUseCase: ListUsersUseCase, getUseCase: GetUsersUseCase, updateUseCase: UpdateUsersUseCase);
    create(dto: CreateUsersDto, req: any): Promise<import("../domain/entities/users.entity").Users>;
    list(query: ListUsersDto, req: any): Promise<{
        data: import("../domain/entities/users.entity").Users[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    get(id: number, req: any): Promise<import("../domain/entities/users.entity").Users>;
    update(id: number, dto: UpdateUsersDto, req: any): Promise<import("../domain/entities/users.entity").Users>;
}
