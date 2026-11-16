import { CreateUsersUseCase } from 'src/modules/users/application/use-cases/create-users.use-case';
import { Repository } from 'typeorm';
import { UsersOrmEntity } from 'src/modules/users/infrastructure/persistence/users.orm-entity';
import { AuthService } from './auth.service';
import { AccessControlService } from './access-control.service';
export declare class AuthController {
    private readonly authService;
    private readonly createUsersUseCase;
    private readonly accessControlService;
    private readonly usersRepo;
    constructor(authService: AuthService, createUsersUseCase: CreateUsersUseCase, accessControlService: AccessControlService, usersRepo: Repository<UsersOrmEntity>);
    register(body: any): Promise<import("../modules/users/domain/entities/users.entity").Users>;
    login(body: any): Promise<{
        access_token: string;
        theme_color: string;
        theme_mode: any;
        photo_url: string;
        super_admin: boolean;
        multi_company: boolean;
    }>;
    me(req: any): Promise<{
        id: number;
        num_document: string;
        name_user: string;
        last_name_user: string;
        full_name: string;
        email: string;
        birth_date: string;
        photo_url: string;
        theme_color: string;
        theme_mode: string;
        enabled: boolean;
        super_admin: boolean;
        multi_company: boolean;
        role_name: string;
        company_name: string;
        created_at: Date;
    }>;
    updateTheme(req: any, body: {
        theme_color?: string;
        theme_mode?: string;
    }): Promise<{
        theme_color: string;
        theme_mode: string;
    }>;
    getAccess(queryCompanyId: string, headerCompanyId: string, req: any): Promise<import("./access-control.service").UserCompanyAccessResponse>;
}
