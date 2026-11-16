export declare class AppointmentItemDto {
    service_id?: number;
    service_name: string;
    duration_minutes?: number;
    price: number;
    tax_rate?: number;
    notes?: string;
}
export declare class CreateAppointmentDto {
    branch_id?: number;
    customer_id: number;
    employee_id: number;
    appointment_date: string;
    start_time: string;
    end_time?: string;
    status?: string;
    notes?: string;
    items: AppointmentItemDto[];
}
export declare class UpdateAppointmentDto {
    branch_id?: number;
    customer_id?: number;
    employee_id?: number;
    appointment_date?: string;
    start_time?: string;
    end_time?: string;
    status?: string;
    notes?: string;
    items?: AppointmentItemDto[];
}
export declare class UpdateAppointmentStatusDto {
    status: string;
    invoice_id?: number;
}
export declare class DayScheduleItemDto {
    day_of_week: number;
    start_time: string;
    end_time: string;
    break_start?: string;
    break_end?: string;
    active: boolean;
}
export declare class SaveEmployeeScheduleDto {
    employee_id: number;
    schedules: DayScheduleItemDto[];
}
