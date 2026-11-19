import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { AccessControlService } from '../access-control.service';

/**
 * Restringe el endpoint a super administradores / developers. Debe ir DESPUÉS de AuthGuard('jwt').
 *
 * Se usa en la administración global del ERP (planes, suscripciones, catálogo de módulos, plantillas,
 * alta de empresas...), que no pertenece a ninguna empresa y por tanto no puede delegarse en el rol de empresa.
 * El privilegio se consulta en BD, no en el token, para respetar cambios posteriores a su emisión.
 */
@Injectable()
export class SuperAdminGuard implements CanActivate {
	constructor(private readonly accessControlService: AccessControlService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();
		const user = request.user;
		if (!user) throw new ForbiddenException('Usuario no autenticado');

		if (!(await this.accessControlService.isSuperAdmin(user))) {
			throw new ForbiddenException('Esta acción es exclusiva de los super administradores');
		}
		return true;
	}
}
