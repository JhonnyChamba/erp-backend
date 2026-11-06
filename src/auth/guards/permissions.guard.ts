import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable,
	SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AccessControlService } from '../access-control.service';

export const REQUIRE_ACCESS_KEY = 'require_access_codes';

/**
 * Decorador para proteger endpoints validando únicamente por el código único
 * de Módulo (ej. 'MOD-001') o Submódulo (ej. 'SUB-001').
 */
export const RequireAccess = (...codes: string[]) => SetMetadata(REQUIRE_ACCESS_KEY, codes);

@Injectable()
export class PermissionsGuard implements CanActivate {
	constructor(
		private readonly reflector: Reflector,
		private readonly accessControlService: AccessControlService,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const requiredCodes = this.reflector.getAllAndOverride<string[]>(REQUIRE_ACCESS_KEY, [
			context.getHandler(),
			context.getClass(),
		]);

		if (!requiredCodes || requiredCodes.length === 0) {
			return true;
		}

		const request = context.switchToHttp().getRequest();
		const user = request.user;
		if (!user) {
			throw new ForbiddenException('Usuario no autenticado');
		}

		const companyId = Number(
			request.headers['x-company-id'] ||
				request.query?.companyId ||
				request.body?.companyId ||
				user.company_id ||
				1,
		);

		const access = await this.accessControlService.getUserCompanyAccess(user, companyId);
		if (access.isSuperAdmin) {
			return true;
		}

		const allowedCodes = new Set<string>([
			...access.moduleCodes.map((c) => c.toUpperCase()),
			...access.subModuleCodes.map((c) => c.toUpperCase()),
		]);

		const hasPermission = requiredCodes.some((code) => allowedCodes.has(code.toUpperCase()));
		if (!hasPermission) {
			throw new ForbiddenException(
				`No tienes permisos en esta empresa para acceder al recurso (${requiredCodes.join(', ')})`,
			);
		}

		return true;
	}
}

