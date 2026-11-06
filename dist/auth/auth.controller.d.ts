import { CreateUsersUseCase } from 'src/modules/users/application/use-cases/create-users.use-case';
import { AuthService } from './auth.service';
import { AccessControlService } from './access-control.service';
export declare class AuthController {
    private readonly authService;
    private readonly createUsersUseCase;
    private readonly accessControlService;
    constructor(authService: AuthService, createUsersUseCase: CreateUsersUseCase, accessControlService: AccessControlService);
    register(body: any): Promise<import("../modules/users/domain/entities/users.entity").Users>;
    login(body: any): Promise<{
        access_token: string;
        theme_color: string;
        super_admin: boolean;
        multi_company: boolean;
    }>;
    getAccess(queryCompanyId: string, headerCompanyId: string, req: any): Promise<import("./access-control.service").UserCompanyAccessResponse>;
}
