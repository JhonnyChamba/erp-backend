import { CreateUsersUseCase } from 'src/modules/users/application/use-cases/create-users.use-case';
import { Controller, Post, Body, Get, Query, Headers, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AccessControlService } from './access-control.service';

@Controller('auth')
export class AuthController {
	constructor(
		private readonly authService: AuthService,
		private readonly createUsersUseCase: CreateUsersUseCase,
		private readonly accessControlService: AccessControlService,
	) { }

	@Post('register')
	async register(@Body() body: any) {
		return this.createUsersUseCase.execute(body);
	}

	@Post('login')
	async login(@Body() body: any) {
		return this.authService.login(body.email, body.password);
	}

	@UseGuards(AuthGuard('jwt'))
	@Get('access')
	async getAccess(
		@Query('companyId') queryCompanyId: string,
		@Headers('x-company-id') headerCompanyId: string,
		@Req() req: any,
	) {
		const companyId = Number(queryCompanyId || headerCompanyId || req.user?.company_id || 1);
		return this.accessControlService.getUserCompanyAccess(req.user, companyId, true);
	}
}
