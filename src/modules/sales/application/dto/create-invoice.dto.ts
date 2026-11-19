import {
	IsArray,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsPositive,
	IsString,
	Min,
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

	@Type(() => Number)
	@IsNumber()
	@IsOptional()
	warehouse_id?: number;

	@Type(() => Number)
	@IsNumber()
	@IsOptional()
	warehouseId?: number;

	@IsString()
	@IsOptional()
	code?: string;

	@IsString()
	@IsNotEmpty()
	description: string;

	@Type(() => Number)
	@IsNumber({}, { message: 'La cantidad debe ser numérica.' })
	@IsPositive({ message: 'La cantidad debe ser mayor a 0.' })
	quantity: number;

	@Type(() => Number)
	@IsNumber({}, { message: 'El precio unitario debe ser numérico.' })
	@Min(0, { message: 'El precio unitario no puede ser negativo.' })
	unit_price: number;

	@Type(() => Number)
	@IsNumber({}, { message: 'El descuento debe ser numérico.' })
	@Min(0, { message: 'El descuento no puede ser negativo.' })
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

	@Type(() => Number)
	@IsNumber()
	@IsOptional()
	warehouse_id?: number;

	@Type(() => Number)
	@IsNumber()
	@IsOptional()
	warehouseId?: number;

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

