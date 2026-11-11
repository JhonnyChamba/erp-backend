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

	@Type(() => Number)
	@IsNumber()
	@IsOptional()
	category_id?: number;

	@Type(() => Number)
	@IsNumber()
	@IsOptional()
	categoryId?: number;

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

	@Type(() => Number)
	@IsNumber()
	@IsOptional()
	category_id?: number;

	@Type(() => Number)
	@IsNumber()
	@IsOptional()
	categoryId?: number;

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

export class CreateInventoryCategoryDto {
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
	category_type?: string;

	@IsString()
	@IsOptional()
	categoryType?: string;

	@IsString()
	@IsOptional()
	description?: string;

	@IsBoolean()
	@IsOptional()
	enabled?: boolean;
}

export class UpdateInventoryCategoryDto {
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
	category_type?: string;

	@IsString()
	@IsOptional()
	categoryType?: string;

	@IsString()
	@IsOptional()
	description?: string;

	@IsBoolean()
	@IsOptional()
	enabled?: boolean;
}

export class CreateInventoryWarehouseDto {
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
	address?: string;

	@IsString()
	@IsOptional()
	responsible?: string;

	@IsString()
	@IsOptional()
	phone?: string;

	@Type(() => Number)
	@IsNumber()
	@IsOptional()
	branch_id?: number;

	@Type(() => Number)
	@IsNumber()
	@IsOptional()
	branchId?: number;

	@IsBoolean()
	@IsOptional()
	is_default?: boolean;

	@IsBoolean()
	@IsOptional()
	isDefault?: boolean;

	@IsBoolean()
	@IsOptional()
	enabled?: boolean;
}

export class UpdateInventoryWarehouseDto {
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
	address?: string;

	@IsString()
	@IsOptional()
	responsible?: string;

	@IsString()
	@IsOptional()
	phone?: string;

	@Type(() => Number)
	@IsNumber()
	@IsOptional()
	branch_id?: number;

	@Type(() => Number)
	@IsNumber()
	@IsOptional()
	branchId?: number;

	@IsBoolean()
	@IsOptional()
	is_default?: boolean;

	@IsBoolean()
	@IsOptional()
	isDefault?: boolean;

	@IsBoolean()
	@IsOptional()
	enabled?: boolean;
}

/**
 * ============================================================================
 * DTOs PARA EL CATÁLOGO ÚNICO DE CONCEPTOS (PRODUCT, SERVICE, LABOR)
 * ============================================================================
 */
export class CreateUnifiedItemDto {
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
	@IsNotEmpty({ message: 'El nombre del concepto es obligatorio' })
	name: string;

	@IsString()
	@IsOptional()
	description?: string;

	// 'PRODUCT' | 'SERVICE' | 'LABOR'
	@IsString()
	@IsNotEmpty({ message: 'El tipo de concepto (PRODUCT / SERVICE / LABOR) es obligatorio' })
	item_type: string;

	@Type(() => Number)
	@IsNumber()
	@IsOptional()
	product_category_id?: number;

	@Type(() => Number)
	@IsNumber()
	@IsOptional()
	productCategoryId?: number;

	@IsString()
	@IsOptional()
	category_name?: string;

	@IsString()
	@IsOptional()
	unit_measure?: string;

	@Type(() => Number)
	@IsNumber()
	@IsOptional()
	sale_price?: number;

	@Type(() => Number)
	@IsNumber()
	@IsOptional()
	purchase_price?: number;

	@Type(() => Number)
	@IsNumber()
	@IsOptional()
	tax_rate?: number;

	@IsBoolean()
	@IsOptional()
	ind_active?: boolean;

	// Opcional para stock inicial si es PRODUCT
	@Type(() => Number)
	@IsNumber()
	@IsOptional()
	warehouse_id?: number;

	@Type(() => Number)
	@IsNumber()
	@IsOptional()
	initial_stock?: number;
}

export class UpdateUnifiedItemDto {
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
	description?: string;

	@IsString()
	@IsOptional()
	item_type?: string;

	@Type(() => Number)
	@IsNumber()
	@IsOptional()
	product_category_id?: number;

	@Type(() => Number)
	@IsNumber()
	@IsOptional()
	productCategoryId?: number;

	@IsString()
	@IsOptional()
	category_name?: string;

	@IsString()
	@IsOptional()
	unit_measure?: string;

	@Type(() => Number)
	@IsNumber()
	@IsOptional()
	sale_price?: number;

	@Type(() => Number)
	@IsNumber()
	@IsOptional()
	purchase_price?: number;

	@Type(() => Number)
	@IsNumber()
	@IsOptional()
	tax_rate?: number;

	@IsBoolean()
	@IsOptional()
	ind_active?: boolean;
}

export class CreateInventoryMovementDto {
	@Type(() => Number)
	@IsNumber()
	companyId: number;

	@Type(() => Number)
	@IsNumber()
	warehouseId: number;

	@Type(() => Number)
	@IsNumber()
	productId: number;

	@IsString()
	movement_type: 'IN' | 'OUT';

	@IsString()
	movement_reason:
		| 'OPENING'
		| 'PURCHASE'
		| 'SALE'
		| 'CUSTOMER_RETURN'
		| 'SUPPLIER_RETURN'
		| 'ADJUSTMENT'
		| 'TRANSFER'
		| 'REVERSAL';

	@Type(() => Number)
	@IsNumber()
	quantity: number;

	@Type(() => Number)
	@IsNumber()
	@IsOptional()
	unit_cost?: number;

	@IsString()
	@IsOptional()
	collection_origin_id?: string;

	@IsString()
	@IsOptional()
	collection_origin_name?: string;

	@IsString()
	@IsOptional()
	collection_origin_document?: string;

	@IsString()
	@IsOptional()
	movement_group_id?: string;

	@IsString()
	@IsOptional()
	idempotency_key?: string;

	@Type(() => Number)
	@IsNumber()
	@IsOptional()
	reversal_of_movement_id?: number;

	@Type(() => Number)
	@IsNumber()
	@IsOptional()
	created_user_id?: number;
}

export class CreateInventoryAdjustmentDto {
	@Type(() => Number)
	@IsNumber()
	@IsOptional()
	companyId?: number;

	@Type(() => Number)
	@IsNumber()
	warehouse_id: number;

	@Type(() => Number)
	@IsNumber()
	product_id: number;

	@Type(() => Number)
	@IsNumber()
	new_stock: number;

	@IsString()
	@IsNotEmpty({ message: 'El motivo del ajuste es obligatorio' })
	reason: string;

	@Type(() => Number)
	@IsNumber()
	@IsOptional()
	unit_cost?: number;

	@Type(() => Number)
	@IsNumber()
	@IsOptional()
	created_user_id?: number;
}

export class CreateInventoryTransferDto {
	@Type(() => Number)
	@IsNumber()
	@IsOptional()
	companyId?: number;

	@Type(() => Number)
	@IsNumber()
	from_warehouse_id: number;

	@Type(() => Number)
	@IsNumber()
	to_warehouse_id: number;

	@Type(() => Number)
	@IsNumber()
	product_id: number;

	@Type(() => Number)
	@IsNumber()
	quantity: number;

	@IsString()
	@IsOptional()
	notes?: string;

	@Type(() => Number)
	@IsNumber()
	@IsOptional()
	created_user_id?: number;
}
