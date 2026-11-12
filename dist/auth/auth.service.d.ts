import { FindUserByEmailUseCase } from 'src/modules/users/application/use-cases/login-get-users.use-case';
import { JwtService } from '@nestjs/jwt';
export declare class AuthService {
    private readonly findUserByEmailUseCase;
    private jwtService;
    constructor(findUserByEmailUseCase: FindUserByEmailUseCase, jwtService: JwtService);
    login(email: string, password: string): Promise<{
        access_token: string;
        theme_color: string;
        photo_url: string;
        super_admin: boolean;
        multi_company: boolean;
    }>;
}
