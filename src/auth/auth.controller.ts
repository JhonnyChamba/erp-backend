import { CompanyAccessGuard } from 'src/auth/guards/company-access.guard';
import { CreateUsersUseCase } from 'src/modules/users/application/use-cases/create-users.use-case';
import { Controller, Post, Patch, Body, Get, Query, Headers, Req, UseGuards, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersOrmEntity } from 'src/modules/users/infrastructure/persistence/users.orm-entity';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AccessControlService } from './access-control.service';
import { CreateUsersDto } from 'src/modules/users/application/dto/create-users.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
	constructor(
		private readonly authService: AuthService,
		private readonly createUsersUseCase: CreateUsersUseCase,
		private readonly accessControlService: AccessControlService,
		@InjectRepository(UsersOrmEntity)
		private readonly usersRepo: Repository<UsersOrmEntity>,
	) { }

	/**
	 * Alta de usuario. No es un registro público: exige sesión y aplica las mismas reglas que `POST /users`
	 * (el usuario solo puede crear cuentas en sus propias empresas y no puede otorgar privilegios que no tiene).
	 */
	@UseGuards(AuthGuard('jwt'), CompanyAccessGuard)
	@Post('register')
	async register(@Body() body: CreateUsersDto, @Req() req: any) {
		return this.createUsersUseCase.execute(body, req.user);
	}

	@Post('login')
	async login(@Body() body: LoginDto) {
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
			photo_url: user.photo_url || null,
			theme_color: user.theme_color || 'Blue_Theme',
			theme_mode: user.theme_mode || 'dark',
			enabled: user.enabled,
			super_admin: isSuperAdmin,
			multi_company: !isSuperAdmin && Boolean(user.multi_company),
			role_name: access.roleName,
			company_name: user.company?.trade_name || user.company?.business_name || null,
			created_at: user.created_at,
		};
	}

	/** Permite al usuario activo guardar su preferencia de color de tema y modo de apariencia */
	@UseGuards(AuthGuard('jwt'))
	@Patch('theme')
	async updateTheme(@Req() req: any, @Body() body: { theme_color?: string; theme_mode?: string }) {
		const userId = Number(req.user?.user_id);
		const user = await this.usersRepo.findOne({ where: { id: userId, deleted: false } });
		if (!user) throw new NotFoundException('Usuario no encontrado');
		if (body.theme_color) user.theme_color = body.theme_color;
		if (body.theme_mode) user.theme_mode = body.theme_mode;
		await this.usersRepo.save(user);
		return { theme_color: user.theme_color, theme_mode: user.theme_mode };
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
