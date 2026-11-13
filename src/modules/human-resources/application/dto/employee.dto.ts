import {
	IsBoolean,
	IsDateString,
	IsEmail,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
	Max,
	Min,
} from 'class-validator';

export class CreateEmployeeDto {
	@IsOptional()
	@IsNumber()
	branch_id?: number;

	@IsNotEmpty({ message: 'El cargo o categoría es obligatorio' })
	@IsNumber({}, { message: 'El ID de la categoría debe ser numérico' })
	category_id: number;

	@IsOptional()
	@IsNumber()
	user_id?: number;

	@IsNotEmpty({ message: 'El nombre es obligatorio' })
	@IsString()
	first_name: string;

	@IsNotEmpty({ message: 'El apellido es obligatorio' })
	@IsString()
	last_name: string;

	@IsOptional()
	@IsString()
	id_type?: string;

	@IsNotEmpty({ message: 'El número de identificación es obligatorio' })
	@IsString()
	id_number: string;

	@IsOptional()
	@IsString()
	birth_date?: string;

	@IsOptional()
	@IsString()
	gender?: string;

	@IsOptional()
	@IsString()
	phone?: string;

	@IsOptional()
	@IsEmail({}, { message: 'El correo electrónico no es válido' })
	email?: string;

	@IsOptional()
	@IsString()
	address?: string;

	@IsOptional()
	@IsString()
	photo_url?: string;

	@IsOptional()
	@IsString()
	hire_date?: string;

	@IsOptional()
	@IsString()
	contract_type?: string;

	@IsOptional()
	@IsNumber()
	@Min(0)
	base_salary?: number;

	@IsOptional()
	@IsString()
	payment_frequency?: string;

	@IsOptional()
	@IsString()
	bank_name?: string;

	@IsOptional()
	@IsString()
	bank_account_type?: string;

	@IsOptional()
	@IsString()
	bank_account_number?: string;

	@IsOptional()
	@IsString()
	iess_affiliation_code?: string;

	@IsOptional()
	@IsBoolean()
	accepts_appointments?: boolean;

	@IsOptional()
	@IsString()
	calendar_color?: string;

	@IsOptional()
	@IsNumber()
	@Min(0)
	@Max(100)
	commission_rate?: number;

	@IsOptional()
	@IsString()
	status?: string;

	// Homologación y creación de usuario del sistema
	@IsOptional()
	@IsBoolean()
	create_user_account?: boolean;

	@IsOptional()
	@IsString()
	user_email?: string;

	@IsOptional()
	@IsString()
	user_password?: string;

	@IsOptional()
	@IsNumber()
	user_role_id?: number;
}

export class UpdateEmployeeDto {
	@IsOptional()
	@IsNumber()
	branch_id?: number;

	@IsOptional()
	@IsNumber()
	category_id?: number;

	@IsOptional()
	@IsNumber()
	user_id?: number;

	@IsOptional()
	@IsString()
	first_name?: string;

	@IsOptional()
	@IsString()
	last_name?: string;

	@IsOptional()
	@IsString()
	id_type?: string;

	@IsOptional()
	@IsString()
	id_number?: string;

	@IsOptional()
	@IsString()
	birth_date?: string;

	@IsOptional()
	@IsString()
	gender?: string;

	@IsOptional()
	@IsString()
	phone?: string;

	@IsOptional()
	@IsEmail()
	email?: string;

	@IsOptional()
	@IsString()
	address?: string;

	@IsOptional()
	@IsString()
	photo_url?: string;

	@IsOptional()
	@IsString()
	hire_date?: string;

	@IsOptional()
	@IsString()
	contract_type?: string;

	@IsOptional()
	@IsNumber()
	@Min(0)
	base_salary?: number;

	@IsOptional()
	@IsString()
	payment_frequency?: string;

	@IsOptional()
	@IsString()
	bank_name?: string;

	@IsOptional()
	@IsString()
	bank_account_type?: string;

	@IsOptional()
	@IsString()
	bank_account_number?: string;

	@IsOptional()
	@IsString()
	iess_affiliation_code?: string;

	@IsOptional()
	@IsBoolean()
	accepts_appointments?: boolean;

	@IsOptional()
	@IsString()
	calendar_color?: string;

	@IsOptional()
	@IsNumber()
	@Min(0)
	@Max(100)
	commission_rate?: number;

	@IsOptional()
	@IsString()
	status?: string;

	// Homologación y creación de usuario del sistema
	@IsOptional()
	@IsBoolean()
	create_user_account?: boolean;

	@IsOptional()
	@IsString()
	user_email?: string;

	@IsOptional()
	@IsString()
	user_password?: string;

	@IsOptional()
	@IsNumber()
	user_role_id?: number;
}

