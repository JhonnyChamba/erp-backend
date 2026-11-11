import {
	IsArray,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
	ValidateNested,
	Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePurchaseDetailDto {
	@IsOptional()
	@IsString()
	item_type?: string;

	@IsOptional()
	@IsNumber()
	item_id?: number;

	@IsOptional()
	@IsNumber()
	itemId?: number;

	@IsOptional()
	@IsString()
	code?: string;

	@IsNotEmpty({ message: 'La descripción del ítem es obligatoria' })
	@IsString()
	description: string;

	@IsOptional()
	@IsString()
	unit?: string;

	@IsNotEmpty({ message: 'La cantidad es obligatoria' })
	@IsNumber({}, { message: 'La cantidad debe ser numérica' })
	@Min(0.0001, { message: 'La cantidad debe ser mayor a 0' })
	quantity: number;

	@IsNotEmpty({ message: 'El costo unitario es obligatorio' })
	@IsNumber({}, { message: 'El costo unitario debe ser numérico' })
	@Min(0, { message: 'El costo unitario no puede ser negativo' })
	unit_cost: number;

	@IsOptional()
	@IsNumber()
	unitCost?: number;

	@IsOptional()
	@IsNumber()
	tax_rate?: number;

	@IsOptional()
	@IsNumber()
	taxRate?: number;
}

export class CreatePurchaseDto {
	@IsOptional()
	@IsNumber()
	companyId?: number;

	@IsOptional()
	@IsNumber()
	company_id?: number;

	@IsOptional()
	@IsNumber()
	provider_id?: number;

	@IsOptional()
	@IsNumber()
	providerId?: number;

	@IsNotEmpty({ message: 'El nombre o razón social del proveedor es obligatorio' })
	@IsString()
	provider_name: string;

	@IsOptional()
	@IsString()
	providerName?: string;

	@IsOptional()
	@IsString()
	provider_id_type?: string;

	@IsNotEmpty({ message: 'El número de identificación del proveedor es obligatorio' })
	@IsString()
	provider_id_number: string;

	@IsOptional()
	@IsString()
	providerIdNumber?: string;

	@IsOptional()
	@IsString()
	provider_email?: string;

	@IsOptional()
	@IsString()
	provider_phone?: string;

	@IsOptional()
	@IsString()
	provider_address?: string;

	@IsNotEmpty({ message: 'El establecimiento es obligatorio (ej. 001)' })
	@IsString()
	establishment: string;

	@IsNotEmpty({ message: 'El punto de emisión es obligatorio (ej. 001)' })
	@IsString()
	emission_point: string;

	@IsNotEmpty({ message: 'El secuencial de la factura es obligatorio' })
	@IsString()
	sequential: string;

	@IsOptional()
	@IsString()
	invoice_number?: string;

	@IsOptional()
	@IsString()
	authorization_number?: string;

	@IsNotEmpty({ message: 'La fecha de emisión es obligatoria' })
	@IsString()
	issue_date: string;

	@IsNotEmpty({ message: 'La bodega de recepción es obligatoria' })
	@IsNumber({}, { message: 'El ID de la bodega debe ser numérico' })
	warehouse_id: number;

	@IsOptional()
	@IsNumber()
	warehouseId?: number;

	@IsOptional()
	@IsNumber()
	branch_id?: number;

	@IsOptional()
	@IsString()
	payment_method?: string;

	@IsOptional()
	@IsString()
	notes?: string;

	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => CreatePurchaseDetailDto)
	items: CreatePurchaseDetailDto[];
}

