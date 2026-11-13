import { Repository } from 'typeorm';
import { AppointmentOrmEntity } from '../infrastructure/persistence/appointment.orm-entity';
import { AppointmentItemOrmEntity } from '../infrastructure/persistence/appointment-item.orm-entity';
import { EmployeeScheduleOrmEntity } from '../infrastructure/persistence/employee-schedule.orm-entity';
import { EmployeeOrmEntity } from 'src/modules/human-resources/infrastructure/persistence/employee.orm-entity';
import { CustomerOrmEntity } from 'src/modules/contacts/infrastructure/persistence/contacts.orm-entity';
import { CreateAppointmentDto, UpdateAppointmentDto, SaveEmployeeScheduleDto } from './dto/appointment.dto';
export declare class AppointmentsService {
    private readonly appointmentRepo;
    private readonly appointmentItemRepo;
    private readonly scheduleRepo;
    private readonly employeeRepo;
    private readonly customerRepo;
    constructor(appointmentRepo: Repository<AppointmentOrmEntity>, appointmentItemRepo: Repository<AppointmentItemOrmEntity>, scheduleRepo: Repository<EmployeeScheduleOrmEntity>, employeeRepo: Repository<EmployeeOrmEntity>, customerRepo: Repository<CustomerOrmEntity>);
    list(companyId: number, filters?: {
        branchId?: number;
        employeeId?: number;
        customerId?: number;
        startDate?: string;
        endDate?: string;
        status?: string;
        search?: string;
    }): Promise<AppointmentOrmEntity[]>;
    getById(id: number, companyId: number): Promise<AppointmentOrmEntity>;
    private generateOrderNumber;
    private addMinutesToTime;
    create(companyId: number, dto: CreateAppointmentDto): Promise<AppointmentOrmEntity>;
    update(id: number, companyId: number, dto: UpdateAppointmentDto): Promise<AppointmentOrmEntity>;
    changeStatus(id: number, companyId: number, status: string, invoiceId?: number): Promise<AppointmentOrmEntity>;
    delete(id: number, companyId: number): Promise<{
        success: boolean;
        message: string;
    }>;
    getCalendarEvents(companyId: number, filters: {
        startDate: string;
        endDate: string;
        employeeId?: number;
        branchId?: number;
    }): Promise<{
        id: number;
        order_number: string;
        title: string;
        start: string;
        end: string;
        color: string;
        status: string;
        customer: {
            id: number;
            name: string;
            document: string;
            phone: string;
            email: string;
        };
        employee: {
            id: number;
            name: string;
            color: string;
        };
        items: AppointmentItemOrmEntity[];
        total_estimated: number;
        notes: string;
        invoice_id: number;
    }[]>;
    getEmployeeSchedules(companyId: number, employeeId?: number): Promise<EmployeeScheduleOrmEntity[]>;
    saveEmployeeSchedules(companyId: number, dto: SaveEmployeeScheduleDto): Promise<EmployeeScheduleOrmEntity[]>;
}
