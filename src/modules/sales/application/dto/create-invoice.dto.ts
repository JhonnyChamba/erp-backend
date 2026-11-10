import {
	IsArray,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
	ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateInvoiceDetailDto {
	@IsString()
	@IsOptional()
	item_type?: string;

	@Type(() => Number)
	@IsNumber()
	@IsOptional()
	item_id?: number;

	@IsString()
	@IsOptional()
	code?: string;

	@IsString()
	@IsNotEmpty()
	description: string;

	@Type(() => Number)
	@IsNumber()
	quantity: number;

	@Type(() => Number)
	@IsNumber()
	unit_price: number;

	@Type(() => Number)
	@IsNumber()
	@IsOptional()
	discount?: number;

	@Type(() => Number)
	@IsNumber()
	@IsOptional()
	tax_rate?: number;
}

export class CreateInvoiceDto {
	@Type(() => Number)
	@IsNumber()
	@IsOptional()
	companyId?: number;

	// Sucursal (establecimiento) con la que se emite: obligatoria. Define el establecimiento, el punto de emisión por defecto y la dirección.
	@Type(() => Number)
	@IsNumber({}, { message: 'Debes seleccionar la sucursal (establecimiento) con la que se emite la factura' })
	@IsNotEmpty({ message: 'Debes seleccionar la sucursal (establecimiento) con la que se emite la factura' })
	branchId: number;

	@IsString()
	@IsOptional()
	emission_point?: string;

	@IsString()
	@IsOptional()
	issue_date?: string;

	@IsString()
	@IsNotEmpty()
	customer_id_type: string;

	@IsString()
	@IsNotEmpty()
	customer_id_number: string;

	@IsString()
	@IsNotEmpty()
	customer_name: string;

	@IsString()
	@IsOptional()
	customer_address?: string;

	@IsString()
	@IsOptional()
	customer_email?: string;

	@IsString()
	@IsOptional()
	customer_phone?: string;

	@IsString()
	@IsOptional()
	payment_method?: string;

	@IsString()
	@IsOptional()
	notes?: string;

	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => CreateInvoiceDetailDto)
	details: CreateInvoiceDetailDto[];
}

