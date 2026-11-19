import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { AccessControlService } from '../access-control.service';

/**
 * Aislamiento multiempresa. Debe ir DESPUÉS de AuthGuard('jwt').
 *
 * El id de empresa lo envía el cliente (header x-company-id, query o body `companyId` / `company_id`), por lo que no es
 * confiable por sí solo: se valida que el usuario realmente pertenezca a CADA empresa indicada. Si no envía
 * ninguna, se valida la empresa del token (o la 1, que es el valor al que caen los controladores).
 * Deja el id validado en `request.companyId`.
 */
@Injectable()
export class CompanyAccessGuard implements CanActivate {
	constructor(private readonly accessControlService: AccessControlService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();
		const user = request.user;
		if (!user) throw new ForbiddenException('Usuario no autenticado');

		// Se validan también las variantes snake_case: varios DTO aceptan `company_id` además de `companyId`.
		const provided = [
			request.headers?.['x-company-id'],
			request.query?.companyId,
			request.query?.company_id,
			request.body?.companyId,
			request.body?.company_id,
		]
			.filter((v) => v !== undefined && v !== null && v !== '')
			.map((v) => Number(Array.isArray(v) ? v[0] : v));

		const candidates = provided.length ? provided : [Number(user.company_id || 1)];

		for (const companyId of new Set(candidates)) {
			if (!Number.isInteger(companyId) || companyId <= 0) throw new ForbiddenException('Empresa no válida');
			if (!(await this.accessControlService.canAccessCompany(user, companyId))) {
				throw new ForbiddenException('No tienes acceso a la empresa indicada');
			}
		}

		request.companyId = candidates[0];
		return true;
	}
}
