import { CompanyAccessGuard } from 'src/auth/guards/company-access.guard';
import { CreateUsersUseCase } from 'src/modules/users/application/use-cases/create-users.use-case';
import { Controller, Post, Body, Get, Query, Headers, Req, UseGuards, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersOrmEntity } from 'src/modules/users/infrastructure/persistence/users.orm-entity';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AccessControlService } from './access-control.service';

@Controller('auth')
export class AuthController {
	constructor(
		private readonly authService: AuthService,
		private readonly createUsersUseCase: CreateUsersUseCase,
		private readonly accessControlService: AccessControlService,
		@InjectRepository(UsersOrmEntity)
		private readonly usersRepo: Repository<UsersOrmEntity>,
	) { }

	@Post('register')
	async register(@Body() body: any) {
		return this.createUsersUseCase.execute(body);
	}

	@Post('login')
	async login(@Body() body: any) {
		return this.authService.login(body.email, body.password);
	}

	/** Datos básicos del usuario autenticado (perfil). No incluye la contraseña. */
	@UseGuards(AuthGuard('jwt'))
	@Get('me')
	async me(@Req() req: any) {
		const user = await this.usersRepo.findOne({
			where: { id: Number(req.user?.user_id), deleted: false },
			relations: ['company'],
		});
		if (!user) throw new NotFoundException('Usuario no encontrado');

		const access = await this.accessControlService.getUserCompanyAccess(req.user, Number(user.company?.id || req.user?.company_id || 1));
		const isSuperAdmin = Boolean(user.super_admin || user.developer);
		return {
			id: user.id,
			num_document: user.num_document,
			name_user: user.name_user,
			last_name_user: user.last_name_user,
			full_name: `${user.name_user} ${user.last_name_user}`.trim(),
			email: user.email,
			birth_date: user.birth_date ?? null,
			enabled: user.enabled,
			super_admin: isSuperAdmin,
			multi_company: !isSuperAdmin && Boolean(user.multi_company),
			role_name: access.roleName,
			company_name: user.company?.trade_name || user.company?.business_name || null,
			created_at: user.created_at,
		};
	}

	@UseGuards(AuthGuard('jwt'), CompanyAccessGuard)
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
