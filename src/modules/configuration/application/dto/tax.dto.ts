import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateTaxDto {
	@IsNotEmpty({ message: 'El código del impuesto es obligatorio' })
	@IsString()
	code: string;

	@IsNotEmpty({ message: 'El porcentaje es obligatorio' })
	@IsNumber({}, { message: 'El porcentaje debe ser un valor numérico' })
	percentage: number;

	@IsNotEmpty({ message: 'La descripción es obligatoria' })
	@IsString()
	description: string;

	@IsOptional()
	@IsString()
	status?: string;

	@IsOptional()
	@IsBoolean()
	is_default?: boolean;
}

export class UpdateTaxDto {
	@IsOptional()
	@IsString()
	code?: string;

	@IsOptional()
	@IsNumber()
	percentage?: number;

	@IsOptional()
	@IsString()
	description?: string;

	@IsOptional()
	@IsString()
	status?: string;

	@IsOptional()
	@IsBoolean()
	is_default?: boolean;
}

