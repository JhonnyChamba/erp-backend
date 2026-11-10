import { IsEmail, IsIn, IsNumber, IsOptional, IsString, Max, MaxLength, Min, ValidateIf } from 'class-validator';
import { Type } from 'class-transformer';

export const CONTACT_STATES = ['activo', 'inactivo'];
export const DOCUMENT_TYPES = ['04', '05', '06', '07'];
export const PAYMENT_TERMS = ['contado', 'credito_15', 'credito_30', 'credito_60', 'transferencia'];

/**
 * Un mismo DTO sirve para crear y para editar: la validación de forma es opcional y el servicio exige los
 * campos obligatorios al crear (y revalida el documento cuando cambia).
 */
class ContactBaseDto {
	@IsOptional()
	@IsIn(DOCUMENT_TYPES, { message: 'tipo_documento debe ser 04 (RUC), 05 (Cédula), 06 (Pasaporte) o 07 (Consumidor final)' })
	tipo_documento?: string;

	@IsOptional()
	@IsString()
	@MaxLength(20)
	num_document?: string;

	@ValidateIf((o) => o.email !== undefined && o.email !== null && o.email !== '')
	@IsEmail({}, { message: 'email no es un correo válido' })
	@MaxLength(150)
	email?: string;

	@IsOptional()
	@IsString()
	@MaxLength(30)
	telefono?: string;

	@IsOptional()
	@IsString()
	@MaxLength(250)
	direccion?: string;

	@IsOptional()
	@IsIn(CONTACT_STATES, { message: "estado debe ser 'activo' o 'inactivo'" })
	estado?: string;
}

export class CustomerDto extends ContactBaseDto {
	@IsOptional()
	@IsString()
	@MaxLength(200)
	razon_social?: string;

	@IsOptional()
	@IsString()
	@MaxLength(200)
	nombre_comercial?: string;

	@IsOptional()
	@IsString()
	@MaxLength(100)
	ciudad?: string;
}

export class ProviderDto extends ContactBaseDto {
	@IsOptional()
	@IsString()
	@MaxLength(200)
	razon_social?: string;

	@IsOptional()
	@IsString()
	@MaxLength(200)
	nombre_comercial?: string;

	@IsOptional()
	@IsIn(PAYMENT_TERMS, { message: 'forma_pago no es válida' })
	forma_pago?: string;

	@IsOptional()
	@IsString()
	@MaxLength(100)
	banco?: string;

	@IsOptional()
	@IsString()
	@MaxLength(40)
	num_cuenta?: string;
}

export class SellerDto extends ContactBaseDto {
	@IsOptional()
	@IsString()
	@MaxLength(120)
	nombres?: string;

	@IsOptional()
	@IsString()
	@MaxLength(120)
	apellidos?: string;

	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	@Min(0)
	@Max(100, { message: 'comision_pct debe estar entre 0 y 100' })
	comision_pct?: number;
}
