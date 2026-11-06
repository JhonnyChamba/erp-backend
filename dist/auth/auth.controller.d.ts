import { CreateUsersUseCase } from 'src/modules/users/application/use-cases/create-users.use-case';
import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    private readonly createUsersUseCase;
    constructor(authService: AuthService, createUsersUseCase: CreateUsersUseCase);
    register(body: any): Promise<import("../modules/users/domain/entities/users.entity").Users>;
    login(body: any): Promise<{
        access_token: string;
        theme_color: string;
        super_admin: boolean;
        multi_company: boolean;
    }>;
}
