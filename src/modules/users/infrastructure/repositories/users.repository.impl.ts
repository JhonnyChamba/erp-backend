import { UsersRepository } from '../../domain/repositories/users.repository';
import { PasswordService } from 'src/common/password/password.service';
import { AccessControlService } from 'src/auth/access-control.service';
import { UsersOrmEntity } from '../persistence/users.orm-entity';
import { UserCompanyOrmEntity } from 'src/modules/user-company/infrastructure/persistence/user-company.orm-entity';
import { Users, UserCompanyRoleItem } from '../../domain/entities/users.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

@Injectable()
export class UsersRepositoryImpl implements UsersRepository {

	constructor(
		@InjectRepository(UsersOrmEntity)
		private readonly repo: Repository<UsersOrmEntity>,
		@InjectRepository(UserCompanyOrmEntity)
		private readonly userCompanyRepo: Repository<UserCompanyOrmEntity>,
		private readonly passwordService: PasswordService,
	) { }

	async create(user: Users): Promise<Users> {
		if (!user.password) throw new BadRequestException('La contraseña es obligatoria');
		const hashedPassword = await this.passwordService.hash(user.password);
		const isSuperAdmin = Boolean(user.super_admin);
		const isMultiCompany = isSuperAdmin ? false : Boolean(user.multi_company);

		let primaryRoleId: number | null = isSuperAdmin ? null : (user.roleId ?? null);
		if (isMultiCompany && Array.isArray(user.companyRoles)) {
			const matchPrimary = user.companyRoles.find(
				(cr) => Number(cr.companyId) === Number(user.companyId),
			);
			if (matchPrimary?.roleId) {
				primaryRoleId = Number(matchPrimary.roleId);
			}
		}

		const entity = this.repo.create({
			num_document: user.num_document,
			name_user: user.name_user,
			last_name_user: user.last_name_user,
			email: user.email,
			password: hashedPassword,
			developer: isSuperAdmin,
			super_admin: isSuperAdmin,
			multi_company: isMultiCompany,
			enabled: user.enabled,
			theme_color: user.theme_color || 'Blue_Theme',
			theme_mode: user.theme_mode || 'dark',
			birth_date: user.birth_date || null,
			photo_url: user.photo_url || '/controller/images/profile/user-1.jpg',
			company: { id: user.companyId },
			role: primaryRoleId ? ({ id: primaryRoleId } as any) : null,
		});

		const saved = await this.repo.save(entity);

		if (!isSuperAdmin) {
			if (isMultiCompany) {
				await this.syncUserCompanies(
					saved.id,
					user.companyIds || [],
					user.companyRoles || [],
				);
			} else {
				await this.syncUserCompanies(
					saved.id,
					[user.companyId],
					[{ companyId: user.companyId, roleId: primaryRoleId }],
				);
			}
		}

		AccessControlService.clearCache(undefined, saved.id);
		const fullUser = await this.findById(saved.id, user.companyId);
		return fullUser!;
	}

	async findByCompany(companyId?: number, page: number = 1, limit: number = 50): Promise<{ data: Users[]; total: number }> {
		const targetCompanyId = Number(companyId);
		const whereClause = targetCompanyId && targetCompanyId > 0
			? [
				{ company: { id: targetCompanyId }, deleted: false },
				{ userCompanies: { company: { id: targetCompanyId }, deleted: false, enabled: true } },
			]
			: { deleted: false };

		const [users, total] = await this.repo.findAndCount({
			where: whereClause,
			relations: ['company', 'role', 'userCompanies', 'userCompanies.company', 'userCompanies.role'],
			skip: (page - 1) * limit,
			take: limit,
			order: { created_at: 'DESC' },
		});

		return {
			data: users.map(user => this.toDomain(user, targetCompanyId || undefined)),
			total,
		};
	}

	async findById(id: number, companyId?: number, anyCompany: boolean = false): Promise<Users | null> {
		// Aislamiento multiempresa: el usuario debe pertenecer a la empresa indicada (empresa principal o
		// relación usuario-empresa activa). `anyCompany` omite la comprobación y queda reservado a super admin.
		if (companyId && !anyCompany) {
			const belongs = await this.repo.exists({
				where: [
					{ id, deleted: false, company: { id: companyId } },
					{ id, deleted: false, userCompanies: { company: { id: companyId }, deleted: false, enabled: true } },
				],
			});
			if (!belongs) return null;
		}

		// Se carga aparte y sin filtro de empresa para no truncar la lista de empresas del usuario
		const user = await this.repo.findOne({
			where: { id, deleted: false },
			relations: ['company', 'role', 'userCompanies', 'userCompanies.company', 'userCompanies.role'],
		});

		return user ? this.toDomain(user, companyId) : null;
	}

	async update(user: Users): Promise<Users> {
		const isSuperAdmin = Boolean(user.super_admin);
		const isMultiCompany = isSuperAdmin ? false : Boolean(user.multi_company);

		let primaryRoleId: number | null = isSuperAdmin ? null : (user.roleId ?? null);
		if (isMultiCompany && Array.isArray(user.companyRoles)) {
			const matchPrimary = user.companyRoles.find(
				(cr) => Number(cr.companyId) === Number(user.companyId),
			);
			if (matchPrimary?.roleId !== undefined) {
				primaryRoleId = matchPrimary.roleId ? Number(matchPrimary.roleId) : null;
			}
		}

		const updateData: any = {
			num_document: user.num_document,
			name_user: user.name_user,
			last_name_user: user.last_name_user,
			email: user.email,
			developer: isSuperAdmin,
			super_admin: isSuperAdmin,
			multi_company: isMultiCompany,
			enabled: user.enabled,
			theme_color: user.theme_color || 'Blue_Theme',
			theme_mode: user.theme_mode || 'dark',
			birth_date: user.birth_date || null,
			photo_url: user.photo_url || null,
			role: primaryRoleId ? ({ id: primaryRoleId } as any) : null,
		};
		// El hash no se carga en findById: solo se escribe cuando el caso de uso asigna una contraseña nueva
		if (user.password) {
			updateData.password = user.password;
		}
		if (user.companyId) {
			updateData.company = { id: user.companyId };
		}

		await this.repo.update({ id: user.id! }, updateData);

		if (isSuperAdmin) {
			await this.userCompanyRepo
				.createQueryBuilder()
				.update(UserCompanyOrmEntity)
				.set({ deleted: true, enabled: false })
				.where('user_id = :userId', { userId: user.id })
				.execute();
		} else if (isMultiCompany) {
			await this.syncUserCompanies(
				user.id!,
				user.companyIds || [],
				user.companyRoles || [],
			);
		} else {
			await this.syncUserCompanies(
				user.id!,
				[user.companyId],
				[{ companyId: user.companyId, roleId: primaryRoleId }],
			);
		}

		AccessControlService.clearCache(undefined, user.id!);
		const updated = await this.findById(user.id!, user.companyId);
		return updated!;
	}

	async findByEmail(email: string): Promise<Users | null> {
		const user = await this.repo.findOne({
			where: { email },
			relations: ['company', 'role', 'userCompanies', 'userCompanies.company', 'userCompanies.role'],
		});
		if (!user) return null;

		// Único punto que expone el hash: lo necesita el login para verificar la contraseña.
		// La columna es select:false, así que hay que pedirla de forma explícita.
		const credentials = await this.repo
			.createQueryBuilder('u')
			.select('u.id')
			.addSelect('u.password')
			.where('u.id = :id', { id: user.id })
			.getOne();
		user.password = credentials?.password ?? '';

		return this.toDomain(user, undefined, true);
	}

	private async syncUserCompanies(
		userId: number,
		companyIds: number[],
		companyRoles: UserCompanyRoleItem[] = [],
	): Promise<void> {
		const roleMap = new Map<number, number | null>();
		for (const cr of companyRoles || []) {
			const cId = Number(cr.companyId);
			if (cId > 0) {
				roleMap.set(cId, cr.roleId ? Number(cr.roleId) : null);
			}
		}

		const combinedCompanyIds = Array.from(
			new Set([
				...(companyIds || []).map(Number),
				...Array.from(roleMap.keys()),
			]),
		).filter((id) => !isNaN(id) && id > 0);

		const existing = await this.userCompanyRepo.find({
			where: { user: { id: userId } },
			relations: ['company', 'role'],
		});

		const existingMap = new Map<number, UserCompanyOrmEntity>();
		for (const item of existing) {
			const cId = Number(item.company?.id);
			if (cId) {
				existingMap.set(cId, item);
			}
		}

		// Desactivar las que ya no están
		for (const [cId, item] of existingMap.entries()) {
			if (!combinedCompanyIds.includes(cId)) {
				item.deleted = true;
				item.enabled = false;
				await this.userCompanyRepo.save(item);
			}
		}

		// Activar o crear las seleccionadas con su rol por empresa
		for (const cId of combinedCompanyIds) {
			const assignedRoleId = roleMap.get(cId) ?? null;
			const item = existingMap.get(cId);
			if (item) {
				item.deleted = false;
				item.enabled = true;
				item.role = assignedRoleId ? ({ id: assignedRoleId } as any) : null;
				await this.userCompanyRepo.save(item);
			} else {
				const newItem = this.userCompanyRepo.create({
					user: { id: userId } as any,
					company: { id: cId } as any,
					role: assignedRoleId ? ({ id: assignedRoleId } as any) : null,
					enabled: true,
					deleted: false,
				});
				await this.userCompanyRepo.save(newItem);
			}
		}
	}

	private toDomain(entity: UsersOrmEntity, contextCompanyId?: number, includePassword: boolean = false): Users {
		const activeUserCompanies = (entity.userCompanies || []).filter(
			(uc) => !uc.deleted && uc.enabled && uc.company?.id,
		);

		const activeCompanyIds = activeUserCompanies.map((uc) => Number(uc.company.id));

		const companyRoles: UserCompanyRoleItem[] = activeUserCompanies.map((uc) => ({
			companyId: Number(uc.company.id),
			roleId: uc.role?.id ? Number(uc.role.id) : null,
			roleName: uc.role?.description || uc.role?.code || null,
		}));

		const targetCompId = contextCompanyId || entity.company?.id || 1;
		const matchingCompanyRole = companyRoles.find(
			(cr) => Number(cr.companyId) === Number(targetCompId),
		);

		const effectiveRoleId =
			matchingCompanyRole?.roleId ?? (entity.role?.id ? Number(entity.role.id) : null);
		const effectiveRoleName =
			matchingCompanyRole?.roleName ??
			entity.role?.description ??
			entity.role?.code ??
			null;

		return new Users(
			entity.id,
			entity.num_document,
			entity.name_user,
			entity.last_name_user,
			entity.email,
			includePassword ? entity.password : undefined,
			entity.company?.id ?? (entity as any).company_id ?? 1,
			entity.developer ?? false,
			entity.multi_company ?? false,
			entity.enabled ?? true,
			entity.deleted ?? false,
			entity.created_at,
			entity.theme_color || 'Blue_Theme',
			entity.super_admin ?? false,
			activeCompanyIds,
			effectiveRoleId,
			effectiveRoleName,
			companyRoles,
			entity.birth_date ?? null,
			entity.photo_url ?? null,
			entity.theme_mode || 'dark',
		);
	}
}
