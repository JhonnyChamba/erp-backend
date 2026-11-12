import { IsNotEmpty, IsNumber, IsOptional, IsString, Length, Min } from 'class-validator';

export class CreateEmissionPointDto {
	@IsOptional()
	@IsNumber({}, { message: 'El ID de la empresa debe ser numérico' })
	companyId?: number;

	@IsNotEmpty({ message: 'La descripción del punto de emisión es obligatoria' })
	@IsString()
	description: string;

	@IsNotEmpty({ message: 'Debe seleccionar la sucursal' })
	@IsNumber({}, { message: 'El ID de la sucursal debe ser numérico' })
	branch_id: number;

	@IsNotEmpty({ message: 'La serie es obligatoria (ej: 001, 856)' })
	@IsString()
	@Length(1, 10, { message: 'La serie debe tener entre 1 y 10 caracteres' })
	serie: string;

	@IsOptional()
	@IsNumber({}, { message: 'El correlativo inicial debe ser numérico' })
	@Min(0, { message: 'El correlativo inicial no puede ser negativo' })
	initial_correlative?: number;
}

export class UpdateEmissionPointDto {
	@IsOptional()
	@IsNumber()
	companyId?: number;

	@IsOptional()
	@IsString()
	description?: string;

	@IsOptional()
	@IsNumber()
	branch_id?: number;

	@IsOptional()
	@IsString()
	serie?: string;

	@IsOptional()
	enabled?: boolean;
}

export class UpdateSequenceDto {
	@IsOptional()
	@IsNumber()
	companyId?: number;

	@IsNotEmpty({ message: 'El correlativo es obligatorio' })
	@IsNumber({}, { message: 'El correlativo debe ser numérico' })
	@Min(0, { message: 'El correlativo no puede ser negativo' })
	correlative: number;
}

