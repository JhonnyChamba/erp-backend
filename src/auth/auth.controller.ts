import { CreateUsersUseCase } from 'src/modules/users/application/use-cases/create-users.use-case';
import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
	constructor(
		private readonly authService: AuthService,
		private readonly createUsersUseCase: CreateUsersUseCase,
	) { }

	@Post('register')
	async register(@Body() body: any) {
		return this.createUsersUseCase.execute(body);
	}

	@Post('login')
	async login(@Body() body: any) {
		return this.authService.login(body.email, body.password);
	}
}
