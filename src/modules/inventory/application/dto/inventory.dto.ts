import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateInventoryItemDto {
	@Type(() => Number)
	@IsNumber()
	@IsOptional()
	companyId?: number;

	@IsString()
	@IsOptional()
	code?: string;

	@IsString()
	@IsOptional()
	sku?: string;

	@IsString()
	@IsNotEmpty()
	name: string;

	@IsString()
	@IsOptional()
	category?: string;

	@IsString()
	@IsOptional()
	unit_measure?: string;

	@IsString()
	@IsOptional()
	unit?: string;

	@Type(() => Number)
	@IsNumber()
	@IsOptional()
	cost_price?: number;

	@Type(() => Number)
	@IsNumber()
	@IsOptional()
	costPrice?: number;

	@Type(() => Number)
	@IsNumber()
	@IsOptional()
	sale_price?: number;

	@Type(() => Number)
	@IsNumber()
	@IsOptional()
	salePrice?: number;

	@Type(() => Number)
	@IsNumber()
	@IsOptional()
	tax_rate?: number;

	@Type(() => Number)
	@IsNumber()
	@IsOptional()
	taxRate?: number;

	@Type(() => Number)
	@IsNumber()
	@IsOptional()
	stock_current?: number;

	@Type(() => Number)
	@IsNumber()
	@IsOptional()
	stockCurrent?: number;

	@Type(() => Number)
	@IsNumber()
	@IsOptional()
	stock_min?: number;

	@Type(() => Number)
	@IsNumber()
	@IsOptional()
	stockMin?: number;

	@IsString()
	@IsOptional()
	warehouse_location?: string;

	@IsString()
	@IsOptional()
	location?: string;

	@IsString()
	@IsOptional()
	description?: string;

	@IsBoolean()
	@IsOptional()
	enabled?: boolean;

	@IsBoolean()
	@IsOptional()
	status?: boolean;
}

export class UpdateInventoryItemDto {
	@Type(() => Number)
	@IsNumber()
	@IsOptional()
	companyId?: number;

	@IsString()
	@IsOptional()
	code?: string;

	@IsString()
	@IsOptional()
	sku?: string;

	@IsString()
	@IsOptional()
	name?: string;

	@IsString()
	@IsOptional()
	category?: string;

	@IsString()
	@IsOptional()
	unit_measure?: string;

	@IsString()
	@IsOptional()
	unit?: string;

	@Type(() => Number)
	@IsNumber()
	@IsOptional()
	cost_price?: number;

	@Type(() => Number)
	@IsNumber()
	@IsOptional()
	costPrice?: number;

	@Type(() => Number)
	@IsNumber()
	@IsOptional()
	sale_price?: number;

	@Type(() => Number)
	@IsNumber()
	@IsOptional()
	salePrice?: number;

	@Type(() => Number)
	@IsNumber()
	@IsOptional()
	tax_rate?: number;

	@Type(() => Number)
	@IsNumber()
	@IsOptional()
	taxRate?: number;

	@Type(() => Number)
	@IsNumber()
	@IsOptional()
	stock_current?: number;

	@Type(() => Number)
	@IsNumber()
	@IsOptional()
	stockCurrent?: number;

	@Type(() => Number)
	@IsNumber()
	@IsOptional()
	stock_min?: number;

	@Type(() => Number)
	@IsNumber()
	@IsOptional()
	stockMin?: number;

	@IsString()
	@IsOptional()
	warehouse_location?: string;

	@IsString()
	@IsOptional()
	location?: string;

	@IsString()
	@IsOptional()
	description?: string;

	@IsBoolean()
	@IsOptional()
	enabled?: boolean;

	@IsBoolean()
	@IsOptional()
	status?: boolean;
}

export class CreateInventoryServiceDto {
	@Type(() => Number)
	@IsNumber()
	@IsOptional()
	companyId?: number;

	@IsString()
	@IsOptional()
	code?: string;

	@IsString()
	@IsNotEmpty()
	name: string;

	@IsString()
	@IsOptional()
	category?: string;

	@IsString()
	@IsOptional()
	billing_unit?: string;

	@IsString()
	@IsOptional()
	unit?: string;

	@Type(() => Number)
	@IsNumber()
	@IsOptional()
	base_cost?: number;

	@Type(() => Number)
	@IsNumber()
	@IsOptional()
	costPrice?: number;

	@Type(() => Number)
	@IsNumber()
	@IsOptional()
	sale_price?: number;

	@Type(() => Number)
	@IsNumber()
	@IsOptional()
	salePrice?: number;

	@Type(() => Number)
	@IsNumber()
	@IsOptional()
	tax_rate?: number;

	@Type(() => Number)
	@IsNumber()
	@IsOptional()
	taxRate?: number;

	@IsString()
	@IsOptional()
	estimated_duration?: string;

	@IsString()
	@IsOptional()
	estimatedDuration?: string;

	@IsString()
	@IsOptional()
	description?: string;

	@IsBoolean()
	@IsOptional()
	enabled?: boolean;

	@IsBoolean()
	@IsOptional()
	status?: boolean;
}

export class UpdateInventoryServiceDto {
	@Type(() => Number)
	@IsNumber()
	@IsOptional()
	companyId?: number;

	@IsString()
	@IsOptional()
	code?: string;

	@IsString()
	@IsOptional()
	name?: string;

	@IsString()
	@IsOptional()
	category?: string;

	@IsString()
	@IsOptional()
	billing_unit?: string;

	@IsString()
	@IsOptional()
	unit?: string;

	@Type(() => Number)
	@IsNumber()
	@IsOptional()
	base_cost?: number;

	@Type(() => Number)
	@IsNumber()
	@IsOptional()
	costPrice?: number;

	@Type(() => Number)
	@IsNumber()
	@IsOptional()
	sale_price?: number;

	@Type(() => Number)
	@IsNumber()
	@IsOptional()
	salePrice?: number;

	@Type(() => Number)
	@IsNumber()
	@IsOptional()
	tax_rate?: number;

	@Type(() => Number)
	@IsNumber()
	@IsOptional()
	taxRate?: number;

	@IsString()
	@IsOptional()
	estimated_duration?: string;

	@IsString()
	@IsOptional()
	estimatedDuration?: string;

	@IsString()
	@IsOptional()
	description?: string;

	@IsBoolean()
	@IsOptional()
	enabled?: boolean;

	@IsBoolean()
	@IsOptional()
	status?: boolean;
}

export class CreateInventorySubcontractDto {
	@Type(() => Number)
	@IsNumber()
	@IsOptional()
	companyId?: number;

	@IsString()
	@IsOptional()
	code?: string;

	@IsString()
	@IsNotEmpty()
	name: string;

	@IsString()
	@IsOptional()
	specialty_area?: string;

	@IsString()
	@IsOptional()
	specialty?: string;

	@IsString()
	@IsOptional()
	contractor_name?: string;

	@IsString()
	@IsOptional()
	contractorName?: string;

	@IsString()
	@IsOptional()
	contractor_ruc?: string;

	@IsString()
	@IsOptional()
	contractorTaxId?: string;

	@IsString()
	@IsOptional()
	unit_measure?: string;

	@IsString()
	@IsOptional()
	unit?: string;

	@Type(() => Number)
	@IsNumber()
	@IsOptional()
	unit_cost?: number;

	@Type(() => Number)
	@IsNumber()
	@IsOptional()
	unitCost?: number;

	@Type(() => Number)
	@IsNumber()
	@IsOptional()
	suggested_price?: number;

	@Type(() => Number)
	@IsNumber()
	@IsOptional()
	suggestedPrice?: number;

	@Type(() => Number)
	@IsNumber()
	@IsOptional()
	tax_rate?: number;

	@Type(() => Number)
	@IsNumber()
	@IsOptional()
	taxRate?: number;

	@IsBoolean()
	@IsOptional()
	includes_materials?: boolean;

	@IsBoolean()
	@IsOptional()
	includesMaterials?: boolean;

	@IsString()
	@IsOptional()
	description?: string;

	@IsBoolean()
	@IsOptional()
	enabled?: boolean;

	@IsBoolean()
	@IsOptional()
	status?: boolean;
}

export class UpdateInventorySubcontractDto {
	@Type(() => Number)
	@IsNumber()
	@IsOptional()
	companyId?: number;

	@IsString()
	@IsOptional()
	code?: string;

	@IsString()
	@IsOptional()
	name?: string;

	@IsString()
	@IsOptional()
	specialty_area?: string;

	@IsString()
	@IsOptional()
	specialty?: string;

	@IsString()
	@IsOptional()
	contractor_name?: string;

	@IsString()
	@IsOptional()
	contractorName?: string;

	@IsString()
	@IsOptional()
	contractor_ruc?: string;

	@IsString()
	@IsOptional()
	contractorTaxId?: string;

	@IsString()
	@IsOptional()
	unit_measure?: string;

	@IsString()
	@IsOptional()
	unit?: string;

	@Type(() => Number)
	@IsNumber()
	@IsOptional()
	unit_cost?: number;

	@Type(() => Number)
	@IsNumber()
	@IsOptional()
	unitCost?: number;

	@Type(() => Number)
	@IsNumber()
	@IsOptional()
	suggested_price?: number;

	@Type(() => Number)
	@IsNumber()
	@IsOptional()
	suggestedPrice?: number;

	@Type(() => Number)
	@IsNumber()
	@IsOptional()
	tax_rate?: number;

	@Type(() => Number)
	@IsNumber()
	@IsOptional()
	taxRate?: number;

	@IsBoolean()
	@IsOptional()
	includes_materials?: boolean;

	@IsBoolean()
	@IsOptional()
	includesMaterials?: boolean;

	@IsString()
	@IsOptional()
	description?: string;

	@IsBoolean()
	@IsOptional()
	enabled?: boolean;

	@IsBoolean()
	@IsOptional()
	status?: boolean;
}
