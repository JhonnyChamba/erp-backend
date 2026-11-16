import { AppointmentsService } from '../application/appointments.service';
import { CreateAppointmentDto, UpdateAppointmentDto, UpdateAppointmentStatusDto, SaveEmployeeScheduleDto } from '../application/dto/appointment.dto';
export declare class AppointmentsController {
    private readonly appointmentsService;
    constructor(appointmentsService: AppointmentsService);
    private resolveCompanyId;
    list(companyIdQuery: string, branchIdQuery: string, employeeIdQuery: string, customerIdQuery: string, startDate: string, endDate: string, status: string, search: string, req: any): Promise<import("../infrastructure/persistence/appointment.orm-entity").AppointmentOrmEntity[]>;
    calendar(companyIdQuery: string, startDate: string, endDate: string, employeeIdQuery: string, branchIdQuery: string, req: any): Promise<{
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
        items: import("../infrastructure/persistence/appointment-item.orm-entity").AppointmentItemOrmEntity[];
        total_estimated: number;
        notes: string;
        invoice_id: number;
    }[]>;
    getSchedules(companyIdQuery: string, employeeIdQuery: string, req: any): Promise<import("../infrastructure/persistence/employee-schedule.orm-entity").EmployeeScheduleOrmEntity[]>;
    saveSchedules(dto: SaveEmployeeScheduleDto, req: any): Promise<import("../infrastructure/persistence/employee-schedule.orm-entity").EmployeeScheduleOrmEntity[]>;
    getById(id: string, companyIdQuery: string, req: any): Promise<import("../infrastructure/persistence/appointment.orm-entity").AppointmentOrmEntity>;
    create(dto: CreateAppointmentDto, req: any): Promise<import("../infrastructure/persistence/appointment.orm-entity").AppointmentOrmEntity>;
    update(id: string, dto: UpdateAppointmentDto, req: any): Promise<import("../infrastructure/persistence/appointment.orm-entity").AppointmentOrmEntity>;
    changeStatus(id: string, dto: UpdateAppointmentStatusDto, req: any): Promise<import("../infrastructure/persistence/appointment.orm-entity").AppointmentOrmEntity>;
    delete(id: string, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
}
