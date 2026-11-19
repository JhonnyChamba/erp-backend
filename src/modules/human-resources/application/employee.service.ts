import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { EmployeeOrmEntity } from '../infrastructure/persistence/employee.orm-entity';
import { UsersOrmEntity } from 'src/modules/users/infrastructure/persistence/users.orm-entity';
import { RolesOrmEntity } from 'src/modules/roles/infrastructure/persistence/roles.orm-entity';
import { PasswordService } from 'src/common/password/password.service';
import { CreateEmployeeDto, UpdateEmployeeDto } from './dto/employee.dto';

@Injectable()
export class EmployeeService {
	constructor(
		@InjectRepository(EmployeeOrmEntity)
		private readonly employeeRepo: Repository<EmployeeOrmEntity>,
		@InjectRepository(UsersOrmEntity)
		private readonly userRepo: Repository<UsersOrmEntity>,
		private readonly passwordService: PasswordService,
	) {}

	async list(
		companyId: number,
		filters: {
			branchId?: number;
			categoryId?: number;
			acceptsAppointments?: boolean;
			status?: string;
			search?: string;
		} = {},
	): Promise<EmployeeOrmEntity[]> {
		const qb = this.employeeRepo
			.createQueryBuilder('e')
			.leftJoinAndSelect('e.category', 'cat')
			.leftJoinAndSelect('e.branch', 'br')
			.leftJoinAndSelect('e.user', 'u')
			.leftJoinAndSelect('u.role', 'urole')
			.where('e.company_id = :companyId AND e.deleted = false', { companyId })
			.orderBy('e.last_name', 'ASC')
			.addOrderBy('e.first_name', 'ASC');

		if (filters.branchId) {
			qb.andWhere('(e.branch_id = :branchId OR e.branch_id IS NULL)', { branchId: filters.branchId });
		}

		if (filters.categoryId) {
			qb.andWhere('e.category_id = :categoryId', { categoryId: filters.categoryId });
		}

		if (filters.acceptsAppointments !== undefined) {
			qb.andWhere('e.accepts_appointments = :accepts', { accepts: filters.acceptsAppointments });
		}

		if (filters.status) {
			qb.andWhere('e.status = :status', { status: filters.status });
		}

		if (filters.search) {
			const term = `%${filters.search.trim().toLowerCase()}%`;
			qb.andWhere(
				'(LOWER(e.first_name) LIKE :term OR LOWER(e.last_name) LIKE :term OR e.id_number LIKE :term OR LOWER(cat.name) LIKE :term)',
				{ term },
			);
		}

		return qb.getMany();
	}

	async getById(id: number, companyId: number): Promise<EmployeeOrmEntity> {
		const employee = await this.employeeRepo.findOne({
			where: { id, company_id: companyId, deleted: false },
			relations: ['category', 'branch', 'user', 'user.role'],
		});
		if (!employee) {
			throw new NotFoundException(`Empleado con ID ${id} no encontrado.`);
		}
		return employee;
	}

	/**
	 * El usuario debe pertenecer a la empresa activa: como empresa principal o por un
	 * vínculo multiempresa vigente (mismo criterio que el listado de usuarios).
	 */
	private async findCompanyUser(manager: EntityManager, userId: number, companyId: number): Promise<UsersOrmEntity> {
		const user = await manager
			.getRepository(UsersOrmEntity)
			.createQueryBuilder('u')
			.leftJoinAndSelect('u.company', 'c')
			.where('u.id = :userId AND u.deleted = false', { userId })
			.andWhere(
				'(u.company_id = :companyId OR EXISTS (SELECT 1 FROM tab_users_company uc WHERE uc.user_id = u.id AND uc.company_id = :companyId AND uc.deleted = false AND uc.enabled = true))',
				{ companyId },
			)
			.getOne();
		if (!user) {
			throw new BadRequestException('El usuario seleccionado no pertenece a la empresa activa.');
		}
		return user;
	}

	private async assertCompanyRole(manager: EntityManager, roleId: number, companyId: number): Promise<void> {
		const role = await manager.getRepository(RolesOrmEntity).findOne({
			where: { id: roleId, company: { id: companyId }, deleted: false },
		});
		if (!role) {
			throw new BadRequestException('El rol seleccionado no pertenece a la empresa activa.');
		}
	}

	private async assertEmailAvailable(manager: EntityManager, email: string, ownUserId?: number): Promise<void> {
		const existing = await manager.getRepository(UsersOrmEntity).findOne({
			where: { email, deleted: false },
		});
		if (existing && existing.id !== ownUserId) {
			throw new BadRequestException(`Ya existe un usuario con el correo electrónico ${email}.`);
		}
	}

	/** Crea el usuario de acceso del empleado dentro de la transacción recibida. */
	private async createSystemUser(
		manager: EntityManager,
		companyId: number,
		data: {
			email?: string;
			password?: string;
			roleId?: number;
			document: string;
			firstName: string;
			lastName: string;
			photoUrl?: string | null;
		},
	): Promise<number> {
		const cleanEmail = (data.email || '').trim().toLowerCase();
		if (!cleanEmail || !data.password || data.password.trim() === '') {
			throw new BadRequestException('Para crear el usuario de acceso se requieren el correo y la contraseña.');
		}
		await this.assertEmailAvailable(manager, cleanEmail);
		if (data.roleId) {
			await this.assertCompanyRole(manager, data.roleId, companyId);
		}

		const userRepo = manager.getRepository(UsersOrmEntity);
		const hashedPassword = await this.passwordService.hash(data.password);
		const newUser = userRepo.create({
			company: { id: companyId },
			role: data.roleId ? { id: data.roleId } : undefined,
			num_document: data.document,
			name_user: data.firstName,
			last_name_user: data.lastName,
			email: cleanEmail,
			password: hashedPassword,
			photo_url: data.photoUrl || '/controller/images/profile/user-1.jpg',
			theme_color: 'Blue_Theme',
			enabled: true,
			deleted: false,
		});
		const savedUser = await userRepo.save(newUser);
		return savedUser.id;
	}

	async create(companyId: number, dto: CreateEmployeeDto): Promise<EmployeeOrmEntity> {
		// Los campos de usuario del sistema no son columnas del empleado.
		const { create_user_account, user_email, user_password, user_role_id, user_id, ...employeeFields } = dto;

		// Usuario + empleado en una sola transacción: si falla el empleado no queda un usuario huérfano.
		const savedId = await this.employeeRepo.manager.transaction(async (manager) => {
			let assignedUserId: number | null = null;

			if (create_user_account) {
				assignedUserId = await this.createSystemUser(manager, companyId, {
					email: user_email,
					password: user_password,
					roleId: user_role_id,
					document: dto.id_number,
					firstName: dto.first_name,
					lastName: dto.last_name,
					photoUrl: dto.photo_url,
				});
			} else if (user_id) {
				assignedUserId = (await this.findCompanyUser(manager, user_id, companyId)).id;
			}

			const repo = manager.getRepository(EmployeeOrmEntity);
			const saved = await repo.save(
				repo.create({
					...employeeFields,
					user_id: assignedUserId,
					company_id: companyId,
				}),
			);
			return saved.id;
		});

		return this.getById(savedId, companyId);
	}

	async update(id: number, companyId: number, dto: UpdateEmployeeDto): Promise<EmployeeOrmEntity> {
		// Los campos de usuario del sistema no son columnas del empleado.
		const { create_user_account, user_email, user_password, user_role_id, user_id, ...employeeFields } = dto;

		await this.employeeRepo.manager.transaction(async (manager) => {
			const repo = manager.getRepository(EmployeeOrmEntity);
			// Se carga SIN relaciones: con category/branch/user cargadas TypeORM toma la FK del
			// objeto relacionado e ignora el cambio de category_id / branch_id / user_id.
			const employee = await repo.findOne({ where: { id, company_id: companyId, deleted: false } });
			if (!employee) {
				throw new NotFoundException(`Empleado con ID ${id} no encontrado.`);
			}

			let assignedUserId: number | null = employee.user_id;

			if (create_user_account) {
				if (employee.user_id) {
					// Cambiar correo / contraseña / rol del usuario YA vinculado a este empleado.
					const linked = await this.findCompanyUser(manager, employee.user_id, companyId);
					if (linked.super_admin || linked.developer || Number(linked.company?.id) !== Number(companyId)) {
						throw new ForbiddenException(
							'Las credenciales de este usuario no se pueden cambiar desde Talento Humano; adminístralo desde Usuarios.',
						);
					}
					const cleanEmail = (user_email || '').trim().toLowerCase();
					if (!cleanEmail) {
						throw new BadRequestException('El correo del usuario de acceso es obligatorio.');
					}
					await this.assertEmailAvailable(manager, cleanEmail, linked.id);
					linked.email = cleanEmail;
					if (user_password && user_password.trim() !== '') {
						linked.password = await this.passwordService.hash(user_password);
					}
					if (user_role_id) {
						await this.assertCompanyRole(manager, user_role_id, companyId);
						linked.role = { id: user_role_id } as any;
					}
					await manager.getRepository(UsersOrmEntity).save(linked);
				} else {
					// El empleado no tenía usuario: se crea (correo y contraseña obligatorios).
					assignedUserId = await this.createSystemUser(manager, companyId, {
						email: user_email,
						password: user_password,
						roleId: user_role_id,
						document: dto.id_number || employee.id_number,
						firstName: dto.first_name || employee.first_name,
						lastName: dto.last_name || employee.last_name,
						photoUrl: dto.photo_url || employee.photo_url,
					});
				}
			} else if (user_id !== undefined) {
				// Vincular / desvincular: solo usuarios de la empresa activa.
				if (user_id === null) {
					assignedUserId = null;
				} else if (user_id !== employee.user_id) {
					assignedUserId = (await this.findCompanyUser(manager, user_id, companyId)).id;
				}
			}

			Object.assign(employee, employeeFields);
			employee.user_id = assignedUserId;
			await repo.save(employee);
		});

		return this.getById(id, companyId);
	}

	async toggleStatus(id: number, companyId: number): Promise<EmployeeOrmEntity> {
		const employee = await this.getById(id, companyId);
		employee.status = employee.status === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
		return this.employeeRepo.save(employee);
	}

	async remove(id: number, companyId: number): Promise<void> {
		const employee = await this.getById(id, companyId);
		employee.deleted = true;
		await this.employeeRepo.save(employee);
	}
}

