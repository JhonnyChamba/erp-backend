import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmployeeOrmEntity } from '../infrastructure/persistence/employee.orm-entity';
import { UsersOrmEntity } from 'src/modules/users/infrastructure/persistence/users.orm-entity';
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

	async create(companyId: number, dto: CreateEmployeeDto): Promise<EmployeeOrmEntity> {
		let assignedUserId: number | null = dto.user_id || null;

		// Si se solicitó crear un nuevo usuario para este empleado
		if (dto.create_user_account && dto.user_email && dto.user_password) {
			const cleanEmail = dto.user_email.trim().toLowerCase();
			const existing = await this.userRepo.findOne({
				where: { email: cleanEmail, deleted: false },
			});
			if (existing) {
				throw new BadRequestException(`Ya existe un usuario con el correo electrónico ${cleanEmail}.`);
			}

			const hashedPassword = await this.passwordService.hash(dto.user_password);
			const newUser = this.userRepo.create({
				company: { id: companyId },
				role: dto.user_role_id ? { id: dto.user_role_id } : undefined,
				num_document: dto.id_number,
				name_user: dto.first_name,
				last_name_user: dto.last_name,
				email: cleanEmail,
				password: hashedPassword,
				photo_url: dto.photo_url || '/controller/images/profile/user-1.jpg',
				theme_color: 'Blue_Theme',
				enabled: true,
				deleted: false,
			});
			const savedUser = await this.userRepo.save(newUser);
			assignedUserId = savedUser.id;
		}

		const entity = this.employeeRepo.create({
			...dto,
			user_id: assignedUserId,
			company_id: companyId,
		});
		const saved = await this.employeeRepo.save(entity);
		return this.getById(saved.id, companyId);
	}

	async update(id: number, companyId: number, dto: UpdateEmployeeDto): Promise<EmployeeOrmEntity> {
		const employee = await this.getById(id, companyId);

		let assignedUserId: number | null = dto.user_id !== undefined ? dto.user_id : employee.user_id;

		// Si se solicitó crear un nuevo usuario y el empleado no tenía o desea crearlo nuevo
		if (dto.create_user_account && dto.user_email && dto.user_password) {
			const cleanEmail = dto.user_email.trim().toLowerCase();
			const existing = await this.userRepo.findOne({
				where: { email: cleanEmail, deleted: false },
			});
			if (existing && existing.id !== employee.user_id) {
				throw new BadRequestException(`Ya existe un usuario con el correo electrónico ${cleanEmail}.`);
			}

			if (employee.user_id) {
				// Actualizar usuario existente vinculado
				const existingUser = await this.userRepo.findOne({ where: { id: employee.user_id } });
				if (existingUser) {
					existingUser.email = cleanEmail;
					if (dto.user_password.trim() !== '') {
						existingUser.password = await this.passwordService.hash(dto.user_password);
					}
					if (dto.user_role_id) {
						existingUser.role = { id: dto.user_role_id } as any;
					}
					await this.userRepo.save(existingUser);
				}
			} else {
				// Crear usuario nuevo
				const hashedPassword = await this.passwordService.hash(dto.user_password);
				const newUser = this.userRepo.create({
					company: { id: companyId },
					role: dto.user_role_id ? { id: dto.user_role_id } : undefined,
					num_document: dto.id_number || employee.id_number,
					name_user: dto.first_name || employee.first_name,
					last_name_user: dto.last_name || employee.last_name,
					email: cleanEmail,
					password: hashedPassword,
					photo_url: dto.photo_url || employee.photo_url || '/controller/images/profile/user-1.jpg',
					theme_color: 'Blue_Theme',
					enabled: true,
					deleted: false,
				});
				const savedUser = await this.userRepo.save(newUser);
				assignedUserId = savedUser.id;
			}
		}

		Object.assign(employee, dto);
		employee.user_id = assignedUserId;
		await this.employeeRepo.save(employee);
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

