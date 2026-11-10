import { IsBoolean, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, Matches, MaxLength, ValidateIf } from 'class-validator';

export class CreateBranchCompanyDto {
	@IsNumber()
	@IsNotEmpty()
	companyId: number;

	// Número de establecimiento SRI: 3 dígitos (001, 002, ...)
	@IsString()
	@Matches(/^[0-9]{3}$/, { message: 'code debe ser el número de establecimiento de 3 dígitos (ej. 001)' })
	code: string;

	@IsString()
	@IsNotEmpty()
	@MaxLength(150)
	name: string;

	@IsString()
	@IsNotEmpty()
	@MaxLength(300)
	address: string;

	// Punto de emisión por defecto: 3 dígitos (por defecto 001)
	@IsOptional()
	@IsString()
	@Matches(/^[0-9]{3}$/, { message: 'emission_point debe ser el punto de emisión de 3 dígitos (ej. 001)' })
	emission_point?: string;

	@IsOptional()
	@IsString()
	@MaxLength(30)
	phone?: string;

	@ValidateIf((o) => o.email !== undefined && o.email !== null && o.email !== '')
	@IsEmail({}, { message: 'email no es un correo válido' })
	@MaxLength(150)
	email?: string;

	@IsOptional()
	@IsBoolean()
	is_matrix?: boolean;
}
