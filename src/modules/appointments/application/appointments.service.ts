import {
	Injectable,
	NotFoundException,
	BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { AppointmentOrmEntity } from '../infrastructure/persistence/appointment.orm-entity';
import { AppointmentItemOrmEntity } from '../infrastructure/persistence/appointment-item.orm-entity';
import { EmployeeScheduleOrmEntity } from '../infrastructure/persistence/employee-schedule.orm-entity';
import { EmployeeOrmEntity } from 'src/modules/human-resources/infrastructure/persistence/employee.orm-entity';
import { CustomerOrmEntity } from 'src/modules/contacts/infrastructure/persistence/contacts.orm-entity';
import {
	CreateAppointmentDto,
	UpdateAppointmentDto,
	SaveEmployeeScheduleDto,
} from './dto/appointment.dto';

@Injectable()
export class AppointmentsService {
	constructor(
		@InjectRepository(AppointmentOrmEntity)
		private readonly appointmentRepo: Repository<AppointmentOrmEntity>,
		@InjectRepository(AppointmentItemOrmEntity)
		private readonly appointmentItemRepo: Repository<AppointmentItemOrmEntity>,
		@InjectRepository(EmployeeScheduleOrmEntity)
		private readonly scheduleRepo: Repository<EmployeeScheduleOrmEntity>,
		@InjectRepository(EmployeeOrmEntity)
		private readonly employeeRepo: Repository<EmployeeOrmEntity>,
		@InjectRepository(CustomerOrmEntity)
		private readonly customerRepo: Repository<CustomerOrmEntity>,
	) {}

	// List appointments with rich relations and filters
	async list(
		companyId: number,
		filters: {
			branchId?: number;
			employeeId?: number;
			customerId?: number;
			startDate?: string;
			endDate?: string;
			status?: string;
			search?: string;
		} = {},
	) {
		const qb = this.appointmentRepo
			.createQueryBuilder('apt')
			.leftJoinAndSelect('apt.customer', 'customer')
			.leftJoinAndSelect('apt.employee', 'employee')
			.leftJoinAndSelect('apt.branch', 'branch')
			.leftJoinAndSelect('apt.items', 'items')
			.where('apt.company_id = :companyId', { companyId })
			.andWhere('apt.deleted = false');

		if (filters.branchId) {
			qb.andWhere('apt.branch_id = :branchId', { branchId: filters.branchId });
		}
		if (filters.employeeId) {
			qb.andWhere('apt.employee_id = :employeeId', { employeeId: filters.employeeId });
		}
		if (filters.customerId) {
			qb.andWhere('apt.customer_id = :customerId', { customerId: filters.customerId });
		}
		if (filters.status) {
			qb.andWhere('apt.status = :status', { status: filters.status });
		}
		if (filters.startDate) {
			qb.andWhere('apt.appointment_date >= :startDate', { startDate: filters.startDate });
		}
		if (filters.endDate) {
			qb.andWhere('apt.appointment_date <= :endDate', { endDate: filters.endDate });
		}
		if (filters.search) {
			qb.andWhere(
				'(LOWER(apt.order_number) LIKE :search OR LOWER(customer.razon_social) LIKE :search OR LOWER(customer.nombre_comercial) LIKE :search OR LOWER(employee.first_name) LIKE :search OR LOWER(employee.last_name) LIKE :search)',
				{ search: `%${filters.search.toLowerCase()}%` },
			);
		}

		qb.orderBy('apt.appointment_date', 'DESC').addOrderBy('apt.start_time', 'ASC');

		return qb.getMany();
	}

	async getById(id: number, companyId: number): Promise<AppointmentOrmEntity> {
		const apt = await this.appointmentRepo.findOne({
			where: { id, company_id: companyId, deleted: false },
			relations: ['customer', 'employee', 'branch', 'items'],
		});
		if (!apt) {
			throw new NotFoundException(`La cita con ID ${id} no existe o no pertenece a esta empresa.`);
		}
		return apt;
	}

	// Generate sequential order number e.g. ORD-2026-0001
	private async generateOrderNumber(companyId: number): Promise<string> {
		const year = new Date().getFullYear();
		const prefix = `ORD-${year}-`;
		const count = await this.appointmentRepo
			.createQueryBuilder('apt')
			.where('apt.company_id = :companyId', { companyId })
			.andWhere('apt.order_number LIKE :prefix', { prefix: `${prefix}%` })
			.getCount();

		const seq = (count + 1).toString().padStart(4, '0');
		return `${prefix}${seq}`;
	}

	// Helper to add minutes to HH:mm:ss
	private addMinutesToTime(timeStr: string, minutesToAdd: number): string {
		const [h, m] = timeStr.split(':').map(Number);
		const totalMin = (h || 0) * 60 + (m || 0) + minutesToAdd;
		const endH = Math.floor(totalMin / 60) % 24;
		const endM = totalMin % 60;
		return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}:00`;
	}

	async create(companyId: number, dto: CreateAppointmentDto): Promise<AppointmentOrmEntity> {
		// Verify customer
		const customer = await this.customerRepo.findOne({
			where: { id: dto.customer_id, company_id: companyId, deleted: false },
		});
		if (!customer) {
			throw new NotFoundException(`El cliente seleccionado no existe.`);
		}

		// Verify employee
		const employee = await this.employeeRepo.findOne({
			where: { id: dto.employee_id, company_id: companyId, deleted: false },
		});
		if (!employee) {
			throw new NotFoundException(`El especialista seleccionado no existe.`);
		}

		// Calculate total duration and prices
		let totalDuration = 0;
		let subtotal = 0;
		let totalTax = 0;

		const processedItems = (dto.items || []).map((item) => {
			const dur = item.duration_minutes || 30;
			totalDuration += dur;
			const price = Number(item.price) || 0;
			const taxRate = item.tax_rate !== undefined ? Number(item.tax_rate) : 15.0;
			const tax = Math.round(price * (taxRate / 100) * 100) / 100;
			const total = price + tax;

			subtotal += price;
			totalTax += tax;

			return {
				service_id: item.service_id || null,
				service_name: item.service_name,
				duration_minutes: dur,
				price,
				tax_rate: taxRate,
				tax_amount: tax,
				total,
				notes: item.notes || null,
			};
		});

		const orderNumber = await this.generateOrderNumber(companyId);
		const startTime = dto.start_time.length === 5 ? `${dto.start_time}:00` : dto.start_time;
		const endTime =
			dto.end_time && dto.end_time.trim() !== ''
				? dto.end_time.length === 5
					? `${dto.end_time}:00`
					: dto.end_time
				: this.addMinutesToTime(startTime, totalDuration > 0 ? totalDuration : 30);

		const appointment = this.appointmentRepo.create({
			company_id: companyId,
			branch_id: dto.branch_id || null,
			customer_id: dto.customer_id,
			employee_id: dto.employee_id,
			order_number: orderNumber,
			appointment_date: dto.appointment_date,
			start_time: startTime,
			end_time: endTime,
			status: dto.status || 'PROGRAMADA',
			subtotal: Math.round(subtotal * 100) / 100,
			tax_amount: Math.round(totalTax * 100) / 100,
			total_estimated: Math.round((subtotal + totalTax) * 100) / 100,
			notes: dto.notes || null,
		});

		const savedApt = await this.appointmentRepo.save(appointment);

		// Save items
		if (processedItems.length > 0) {
			const itemsEntities = processedItems.map((item) =>
				this.appointmentItemRepo.create({
					...item,
					appointment_id: savedApt.id,
				}),
			);
			await this.appointmentItemRepo.save(itemsEntities);
		}

		return this.getById(savedApt.id, companyId);
	}

	async update(id: number, companyId: number, dto: UpdateAppointmentDto): Promise<AppointmentOrmEntity> {
		const apt = await this.getById(id, companyId);

		if (dto.branch_id !== undefined) apt.branch_id = dto.branch_id;
		if (dto.customer_id) apt.customer_id = dto.customer_id;
		if (dto.employee_id) apt.employee_id = dto.employee_id;
		if (dto.appointment_date) apt.appointment_date = dto.appointment_date;
		if (dto.start_time) {
			apt.start_time = dto.start_time.length === 5 ? `${dto.start_time}:00` : dto.start_time;
		}
		if (dto.end_time) {
			apt.end_time = dto.end_time.length === 5 ? `${dto.end_time}:00` : dto.end_time;
		}
		if (dto.status) apt.status = dto.status;
		if (dto.notes !== undefined) apt.notes = dto.notes;

		if (dto.items && Array.isArray(dto.items)) {
			// Remove old items
			await this.appointmentItemRepo.delete({ appointment_id: apt.id });

			let subtotal = 0;
			let totalTax = 0;
			let totalDuration = 0;

			const newItems = dto.items.map((item) => {
				const dur = item.duration_minutes || 30;
				totalDuration += dur;
				const price = Number(item.price) || 0;
				const taxRate = item.tax_rate !== undefined ? Number(item.tax_rate) : 15.0;
				const tax = Math.round(price * (taxRate / 100) * 100) / 100;
				const total = price + tax;

				subtotal += price;
				totalTax += tax;

				return this.appointmentItemRepo.create({
					appointment_id: apt.id,
					service_id: item.service_id || null,
					service_name: item.service_name,
					duration_minutes: dur,
					price,
					tax_rate: taxRate,
					tax_amount: tax,
					total,
					notes: item.notes || null,
				});
			});

			await this.appointmentItemRepo.save(newItems);

			apt.subtotal = Math.round(subtotal * 100) / 100;
			apt.tax_amount = Math.round(totalTax * 100) / 100;
			apt.total_estimated = Math.round((subtotal + totalTax) * 100) / 100;

			if (!dto.end_time && totalDuration > 0) {
				apt.end_time = this.addMinutesToTime(apt.start_time, totalDuration);
			}
		}

		await this.appointmentRepo.save(apt);
		return this.getById(id, companyId);
	}

	async changeStatus(id: number, companyId: number, status: string, invoiceId?: number): Promise<AppointmentOrmEntity> {
		const apt = await this.getById(id, companyId);
		apt.status = status;
		if (invoiceId !== undefined) {
			apt.invoice_id = invoiceId;
		}
		await this.appointmentRepo.save(apt);
		return this.getById(id, companyId);
	}

	async delete(id: number, companyId: number): Promise<{ success: boolean; message: string }> {
		const apt = await this.getById(id, companyId);
		apt.deleted = true;
		await this.appointmentRepo.save(apt);
		return { success: true, message: `Cita ${apt.order_number} eliminada correctamente.` };
	}

	// Calendar View formatted events
	async getCalendarEvents(
		companyId: number,
		filters: {
			startDate: string;
			endDate: string;
			employeeId?: number;
			branchId?: number;
		},
	) {
		const appointments = await this.list(companyId, {
			startDate: filters.startDate,
			endDate: filters.endDate,
			employeeId: filters.employeeId,
			branchId: filters.branchId,
		});

		return appointments.map((apt) => {
			const customerName = apt.customer?.razon_social || apt.customer?.nombre_comercial || 'Cliente';
			const specialistName = apt.employee ? `${apt.employee.first_name} ${apt.employee.last_name}` : 'Especialista';
			const color = apt.employee?.calendar_color || '#0085db';
			const servicesText = (apt.items || []).map((i) => i.service_name).join(', ') || 'Servicios';

			return {
				id: apt.id,
				order_number: apt.order_number,
				title: `${customerName} - ${servicesText}`,
				start: `${apt.appointment_date}T${apt.start_time}`,
				end: `${apt.appointment_date}T${apt.end_time}`,
				color: color,
				status: apt.status,
				customer: {
					id: apt.customer_id,
					name: customerName,
					document: apt.customer?.num_document,
					phone: apt.customer?.telefono,
					email: apt.customer?.email,
				},
				employee: {
					id: apt.employee_id,
					name: specialistName,
					color: color,
				},
				items: apt.items,
				total_estimated: apt.total_estimated,
				notes: apt.notes,
				invoice_id: apt.invoice_id,
			};
		});
	}

	// Employee Working Schedules
	async getEmployeeSchedules(companyId: number, employeeId?: number) {
		const qb = this.scheduleRepo
			.createQueryBuilder('sch')
			.leftJoinAndSelect('sch.employee', 'emp')
			.where('sch.company_id = :companyId', { companyId });

		if (employeeId) {
			qb.andWhere('sch.employee_id = :employeeId', { employeeId });
		}

		qb.orderBy('sch.employee_id', 'ASC').addOrderBy('sch.day_of_week', 'ASC');

		return qb.getMany();
	}

	async saveEmployeeSchedules(companyId: number, dto: SaveEmployeeScheduleDto) {
		const employee = await this.employeeRepo.findOne({
			where: { id: dto.employee_id, company_id: companyId, deleted: false },
		});
		if (!employee) {
			throw new NotFoundException('Especialista no encontrado.');
		}

		// Delete current schedules for employee
		await this.scheduleRepo.delete({ company_id: companyId, employee_id: dto.employee_id });

		// Save new schedules
		const entities = dto.schedules.map((s) =>
			this.scheduleRepo.create({
				company_id: companyId,
				employee_id: dto.employee_id,
				day_of_week: s.day_of_week,
				start_time: s.start_time.length === 5 ? `${s.start_time}:00` : s.start_time,
				end_time: s.end_time.length === 5 ? `${s.end_time}:00` : s.end_time,
				break_start: s.break_start ? (s.break_start.length === 5 ? `${s.break_start}:00` : s.break_start) : null,
				break_end: s.break_end ? (s.break_end.length === 5 ? `${s.break_end}:00` : s.break_end) : null,
				active: s.active,
			}),
		);

		await this.scheduleRepo.save(entities);
		return this.getEmployeeSchedules(companyId, dto.employee_id);
	}
}

