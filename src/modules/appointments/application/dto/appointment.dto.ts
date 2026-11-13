import {
	IsNotEmpty,
	IsOptional,
	IsString,
	IsNumber,
	IsArray,
	ValidateNested,
	IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AppointmentItemDto {
	@IsOptional()
	@IsNumber()
	service_id?: number;

	@IsNotEmpty()
	@IsString()
	service_name: string;

	@IsOptional()
	@IsNumber()
	duration_minutes?: number;

	@IsNotEmpty()
	@IsNumber()
	price: number;

	@IsOptional()
	@IsNumber()
	tax_rate?: number;

	@IsOptional()
	@IsString()
	notes?: string;
}

export class CreateAppointmentDto {
	@IsOptional()
	@IsNumber()
	branch_id?: number;

	@IsNotEmpty()
	@IsNumber()
	customer_id: number;

	@IsNotEmpty()
	@IsNumber()
	employee_id: number;

	@IsNotEmpty()
	@IsString()
	appointment_date: string; // YYYY-MM-DD

	@IsNotEmpty()
	@IsString()
	start_time: string; // HH:mm:ss o HH:mm

	@IsOptional()
	@IsString()
	end_time?: string;

	@IsOptional()
	@IsString()
	status?: string;

	@IsOptional()
	@IsString()
	notes?: string;

	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => AppointmentItemDto)
	items: AppointmentItemDto[];
}

export class UpdateAppointmentDto {
	@IsOptional()
	@IsNumber()
	branch_id?: number;

	@IsOptional()
	@IsNumber()
	customer_id?: number;

	@IsOptional()
	@IsNumber()
	employee_id?: number;

	@IsOptional()
	@IsString()
	appointment_date?: string;

	@IsOptional()
	@IsString()
	start_time?: string;

	@IsOptional()
	@IsString()
	end_time?: string;

	@IsOptional()
	@IsString()
	status?: string;

	@IsOptional()
	@IsString()
	notes?: string;

	@IsOptional()
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => AppointmentItemDto)
	items?: AppointmentItemDto[];
}

export class UpdateAppointmentStatusDto {
	@IsNotEmpty()
	@IsString()
	status: string;

	@IsOptional()
	@IsNumber()
	invoice_id?: number;
}

export class DayScheduleItemDto {
	@IsNotEmpty()
	@IsNumber()
	day_of_week: number; // 0 to 6

	@IsNotEmpty()
	@IsString()
	start_time: string;

	@IsNotEmpty()
	@IsString()
	end_time: string;

	@IsOptional()
	@IsString()
	break_start?: string;

	@IsOptional()
	@IsString()
	break_end?: string;

	@IsBoolean()
	active: boolean;
}

export class SaveEmployeeScheduleDto {
	@IsNotEmpty()
	@IsNumber()
	employee_id: number;

	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => DayScheduleItemDto)
	schedules: DayScheduleItemDto[];
}

