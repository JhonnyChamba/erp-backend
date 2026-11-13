"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const appointment_orm_entity_1 = require("../infrastructure/persistence/appointment.orm-entity");
const appointment_item_orm_entity_1 = require("../infrastructure/persistence/appointment-item.orm-entity");
const employee_schedule_orm_entity_1 = require("../infrastructure/persistence/employee-schedule.orm-entity");
const employee_orm_entity_1 = require("../../human-resources/infrastructure/persistence/employee.orm-entity");
const contacts_orm_entity_1 = require("../../contacts/infrastructure/persistence/contacts.orm-entity");
let AppointmentsService = class AppointmentsService {
    appointmentRepo;
    appointmentItemRepo;
    scheduleRepo;
    employeeRepo;
    customerRepo;
    constructor(appointmentRepo, appointmentItemRepo, scheduleRepo, employeeRepo, customerRepo) {
        this.appointmentRepo = appointmentRepo;
        this.appointmentItemRepo = appointmentItemRepo;
        this.scheduleRepo = scheduleRepo;
        this.employeeRepo = employeeRepo;
        this.customerRepo = customerRepo;
    }
    async list(companyId, filters = {}) {
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
            qb.andWhere('(LOWER(apt.order_number) LIKE :search OR LOWER(customer.razon_social) LIKE :search OR LOWER(customer.nombre_comercial) LIKE :search OR LOWER(employee.first_name) LIKE :search OR LOWER(employee.last_name) LIKE :search)', { search: `%${filters.search.toLowerCase()}%` });
        }
        qb.orderBy('apt.appointment_date', 'DESC').addOrderBy('apt.start_time', 'ASC');
        return qb.getMany();
    }
    async getById(id, companyId) {
        const apt = await this.appointmentRepo.findOne({
            where: { id, company_id: companyId, deleted: false },
            relations: ['customer', 'employee', 'branch', 'items'],
        });
        if (!apt) {
            throw new common_1.NotFoundException(`La cita con ID ${id} no existe o no pertenece a esta empresa.`);
        }
        return apt;
    }
    async generateOrderNumber(companyId) {
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
    addMinutesToTime(timeStr, minutesToAdd) {
        const [h, m] = timeStr.split(':').map(Number);
        const totalMin = (h || 0) * 60 + (m || 0) + minutesToAdd;
        const endH = Math.floor(totalMin / 60) % 24;
        const endM = totalMin % 60;
        return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}:00`;
    }
    async create(companyId, dto) {
        const customer = await this.customerRepo.findOne({
            where: { id: dto.customer_id, company_id: companyId, deleted: false },
        });
        if (!customer) {
            throw new common_1.NotFoundException(`El cliente seleccionado no existe.`);
        }
        const employee = await this.employeeRepo.findOne({
            where: { id: dto.employee_id, company_id: companyId, deleted: false },
        });
        if (!employee) {
            throw new common_1.NotFoundException(`El especialista seleccionado no existe.`);
        }
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
        const endTime = dto.end_time && dto.end_time.trim() !== ''
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
        if (processedItems.length > 0) {
            const itemsEntities = processedItems.map((item) => this.appointmentItemRepo.create({
                ...item,
                appointment_id: savedApt.id,
            }));
            await this.appointmentItemRepo.save(itemsEntities);
        }
        return this.getById(savedApt.id, companyId);
    }
    async update(id, companyId, dto) {
        const apt = await this.getById(id, companyId);
        if (dto.branch_id !== undefined)
            apt.branch_id = dto.branch_id;
        if (dto.customer_id)
            apt.customer_id = dto.customer_id;
        if (dto.employee_id)
            apt.employee_id = dto.employee_id;
        if (dto.appointment_date)
            apt.appointment_date = dto.appointment_date;
        if (dto.start_time) {
            apt.start_time = dto.start_time.length === 5 ? `${dto.start_time}:00` : dto.start_time;
        }
        if (dto.end_time) {
            apt.end_time = dto.end_time.length === 5 ? `${dto.end_time}:00` : dto.end_time;
        }
        if (dto.status)
            apt.status = dto.status;
        if (dto.notes !== undefined)
            apt.notes = dto.notes;
        if (dto.items && Array.isArray(dto.items)) {
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
    async changeStatus(id, companyId, status, invoiceId) {
        const apt = await this.getById(id, companyId);
        apt.status = status;
        if (invoiceId !== undefined) {
            apt.invoice_id = invoiceId;
        }
        await this.appointmentRepo.save(apt);
        return this.getById(id, companyId);
    }
    async delete(id, companyId) {
        const apt = await this.getById(id, companyId);
        apt.deleted = true;
        await this.appointmentRepo.save(apt);
        return { success: true, message: `Cita ${apt.order_number} eliminada correctamente.` };
    }
    async getCalendarEvents(companyId, filters) {
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
    async getEmployeeSchedules(companyId, employeeId) {
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
    async saveEmployeeSchedules(companyId, dto) {
        const employee = await this.employeeRepo.findOne({
            where: { id: dto.employee_id, company_id: companyId, deleted: false },
        });
        if (!employee) {
            throw new common_1.NotFoundException('Especialista no encontrado.');
        }
        await this.scheduleRepo.delete({ company_id: companyId, employee_id: dto.employee_id });
        const entities = dto.schedules.map((s) => this.scheduleRepo.create({
            company_id: companyId,
            employee_id: dto.employee_id,
            day_of_week: s.day_of_week,
            start_time: s.start_time.length === 5 ? `${s.start_time}:00` : s.start_time,
            end_time: s.end_time.length === 5 ? `${s.end_time}:00` : s.end_time,
            break_start: s.break_start ? (s.break_start.length === 5 ? `${s.break_start}:00` : s.break_start) : null,
            break_end: s.break_end ? (s.break_end.length === 5 ? `${s.break_end}:00` : s.break_end) : null,
            active: s.active,
        }));
        await this.scheduleRepo.save(entities);
        return this.getEmployeeSchedules(companyId, dto.employee_id);
    }
};
exports.AppointmentsService = AppointmentsService;
exports.AppointmentsService = AppointmentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(appointment_orm_entity_1.AppointmentOrmEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(appointment_item_orm_entity_1.AppointmentItemOrmEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(employee_schedule_orm_entity_1.EmployeeScheduleOrmEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(employee_orm_entity_1.EmployeeOrmEntity)),
    __param(4, (0, typeorm_1.InjectRepository)(contacts_orm_entity_1.CustomerOrmEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AppointmentsService);
//# sourceMappingURL=appointments.service.js.map