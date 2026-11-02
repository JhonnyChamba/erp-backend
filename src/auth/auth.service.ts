import { FindUserByEmailUseCase } from 'src/modules/users/application/use-cases/login-get-users.use-case';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';

@Injectable()
export class AuthService {
	constructor(
		private readonly findUserByEmailUseCase: FindUserByEmailUseCase,
		private jwtService: JwtService,
	) { }

	async login(email: string, password: string) {

		const user = await this.findUserByEmailUseCase.execute(email);

		if (!user)
			throw new UnauthorizedException('Credenciales inválidas');

		const isMatch = await argon2.verify(user.password, password);

		if (!isMatch)
			throw new UnauthorizedException('Credenciales inválidas');

		if (!user.enabled)
			throw new UnauthorizedException('Usuario Inactivo');

		if (user.deleted)
			throw new UnauthorizedException('Usuario Eliminado.');

		const payload = {
			user_id: user.id,
			user_name: `${user.name_user} ${user.last_name_user}`,
			developer: user.developer,
			multi_company: user.multi_company,
			theme_color: user.theme_color || 'Blue_Theme',
		};

		return {
			access_token: this.jwtService.sign(payload),
			theme_color: user.theme_color || 'Blue_Theme',
		};
	}
}
