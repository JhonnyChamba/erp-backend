import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { AccessControlService } from 'src/auth/access-control.service';
import { Users } from '../domain/entities/users.entity';

export interface UserAssignmentInput {
	/** Empresa principal del usuario (a la que se aplica `roleId`). */
	companyId: number;
	roleId?: number | null;
	companyIds?: number[];
	companyRoles?: { companyId: number; roleId?: number | null }[];
}

/**
 * Reglas de autorización para crear / editar usuarios.
 * Un super admin no tiene restricciones; el resto solo opera dentro de las empresas a las que pertenece.
 */
@Injectable()
export class UsersAccessPolicy {
	constructor(private readonly accessControlService: AccessControlService) { }

	/** Empresas sobre las que puede operar quien llama. `null` = super admin / developer (todas). */
	getActorCompanyIds(currentUser: any): Promise<number[] | null> {
		return this.accessControlService.getAccessibleCompanyIds(currentUser);
	}

	/**
	 * Un usuario normal no puede modificar a un super admin / developer, ni a un usuario que pertenezca
	 * a alguna empresa ajena: cambiarle la contraseña o el correo daría acceso a los datos de esa otra empresa.
	 */
	assertCanManageTarget(actorCompanyIds: number[], target: Users): void {
		if (target.super_admin || target.developer) {
			throw new ForbiddenException('Solo un super administrador puede modificar a este usuario');
		}
		const allowed = new Set(actorCompanyIds.map(Number));
		const targetCompanyIds = [target.companyId, ...(target.companyIds || [])].map(Number);
		if (targetCompanyIds.some((id) => !allowed.has(id))) {
			throw new ForbiddenException(
				'El usuario pertenece a empresas a las que no tienes acceso; solo un super administrador puede modificarlo',
			);
		}
	}

	/**
	 * Un usuario normal solo puede asignar empresas a las que él mismo pertenece, y cada rol debe ser
	 * de la empresa en la que se asigna.
	 */
	async assertCanAssign(actorCompanyIds: number[], input: UserAssignmentInput): Promise<void> {
		const allowed = new Set(actorCompanyIds.map(Number));
		const companyRoles = input.companyRoles || [];

		const requested = new Set<number>([
			Number(input.companyId),
			...(input.companyIds || []).map(Number),
			...companyRoles.map((cr) => Number(cr?.companyId)),
		]);
		for (const companyId of requested) {
			if (!Number.isInteger(companyId) || companyId <= 0) {
				throw new BadRequestException('Empresa no válida');
			}
			if (!allowed.has(companyId)) {
				throw new ForbiddenException('No puedes asignar usuarios a una empresa a la que no perteneces');
			}
		}

		const pairs = [{ companyId: input.companyId, roleId: input.roleId }, ...companyRoles];
		for (const pair of pairs) {
			if (!pair?.roleId) continue;
			if (!(await this.accessControlService.roleBelongsToCompany(Number(pair.roleId), Number(pair.companyId)))) {
				throw new BadRequestException('El rol indicado no pertenece a la empresa seleccionada');
			}
		}
	}
}
