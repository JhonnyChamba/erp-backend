import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateEmployeeCategoryDto {
	@IsNotEmpty({ message: 'El nombre del cargo o categoría es obligatorio' })
	@IsString()
	name: string;

	@IsOptional()
	@IsString()
	description?: string;

	@IsOptional()
	@IsNumber({}, { message: 'El porcentaje de comisión debe ser numérico' })
	@Min(0)
	@Max(100)
	default_commission_rate?: number;

	@IsOptional()
	@IsBoolean()
	active?: boolean;
}

export class UpdateEmployeeCategoryDto {
	@IsOptional()
	@IsString()
	name?: string;

	@IsOptional()
	@IsString()
	description?: string;

	@IsOptional()
	@IsNumber()
	@Min(0)
	@Max(100)
	default_commission_rate?: number;

	@IsOptional()
	@IsBoolean()
	active?: boolean;
}

