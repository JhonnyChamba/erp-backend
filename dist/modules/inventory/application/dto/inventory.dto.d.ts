export declare class CreateInventoryItemDto {
    companyId?: number;
    code?: string;
    sku?: string;
    name: string;
    category_id?: number;
    categoryId?: number;
    category?: string;
    unit_measure?: string;
    unit?: string;
    cost_price?: number;
    costPrice?: number;
    sale_price?: number;
    salePrice?: number;
    tax_rate?: number;
    taxRate?: number;
    stock_current?: number;
    stockCurrent?: number;
    stock_min?: number;
    stockMin?: number;
    warehouse_id?: number;
    warehouseId?: number;
    warehouse_location?: string;
    location?: string;
    description?: string;
    enabled?: boolean;
    status?: boolean;
}
export declare class UpdateInventoryItemDto {
    companyId?: number;
    code?: string;
    sku?: string;
    name?: string;
    category_id?: number;
    categoryId?: number;
    category?: string;
    unit_measure?: string;
    unit?: string;
    cost_price?: number;
    costPrice?: number;
    sale_price?: number;
    salePrice?: number;
    tax_rate?: number;
    taxRate?: number;
    stock_current?: number;
    stockCurrent?: number;
    stock_min?: number;
    stockMin?: number;
    warehouse_id?: number;
    warehouseId?: number;
    warehouse_location?: string;
    location?: string;
    description?: string;
    enabled?: boolean;
    status?: boolean;
}
export declare class CreateInventoryServiceDto {
    companyId?: number;
    code?: string;
    name: string;
    category?: string;
    billing_unit?: string;
    unit?: string;
    base_cost?: number;
    costPrice?: number;
    sale_price?: number;
    salePrice?: number;
    tax_rate?: number;
    taxRate?: number;
    estimated_duration?: string;
    estimatedDuration?: string;
    description?: string;
    enabled?: boolean;
    status?: boolean;
}
export declare class UpdateInventoryServiceDto {
    companyId?: number;
    code?: string;
    name?: string;
    category?: string;
    billing_unit?: string;
    unit?: string;
    base_cost?: number;
    costPrice?: number;
    sale_price?: number;
    salePrice?: number;
    tax_rate?: number;
    taxRate?: number;
    estimated_duration?: string;
    estimatedDuration?: string;
    description?: string;
    enabled?: boolean;
    status?: boolean;
}
export declare class CreateInventorySubcontractDto {
    companyId?: number;
    code?: string;
    name: string;
    specialty_area?: string;
    specialty?: string;
    contractor_name?: string;
    contractorName?: string;
    contractor_ruc?: string;
    contractorTaxId?: string;
    unit_measure?: string;
    unit?: string;
    unit_cost?: number;
    unitCost?: number;
    suggested_price?: number;
    suggestedPrice?: number;
    tax_rate?: number;
    taxRate?: number;
    includes_materials?: boolean;
    includesMaterials?: boolean;
    description?: string;
    enabled?: boolean;
    status?: boolean;
}
export declare class UpdateInventorySubcontractDto {
    companyId?: number;
    code?: string;
    name?: string;
    specialty_area?: string;
    specialty?: string;
    contractor_name?: string;
    contractorName?: string;
    contractor_ruc?: string;
    contractorTaxId?: string;
    unit_measure?: string;
    unit?: string;
    unit_cost?: number;
    unitCost?: number;
    suggested_price?: number;
    suggestedPrice?: number;
    tax_rate?: number;
    taxRate?: number;
    includes_materials?: boolean;
    includesMaterials?: boolean;
    description?: string;
    enabled?: boolean;
    status?: boolean;
}
export declare class CreateInventoryCategoryDto {
    companyId?: number;
    code?: string;
    name: string;
    category_type?: string;
    categoryType?: string;
    description?: string;
    enabled?: boolean;
    status?: boolean;
    ind_active?: boolean;
}
export declare class UpdateInventoryCategoryDto {
    companyId?: number;
    code?: string;
    name?: string;
    category_type?: string;
    categoryType?: string;
    description?: string;
    enabled?: boolean;
    status?: boolean;
    ind_active?: boolean;
}
export declare class CreateInventoryWarehouseDto {
    companyId?: number;
    code?: string;
    name: string;
    address?: string;
    responsible?: string;
    phone?: string;
    branch_id?: number;
    branchId?: number;
    is_default?: boolean;
    isDefault?: boolean;
    enabled?: boolean;
    status?: boolean;
    ind_active?: boolean;
}
export declare class UpdateInventoryWarehouseDto {
    companyId?: number;
    code?: string;
    name?: string;
    address?: string;
    responsible?: string;
    phone?: string;
    branch_id?: number;
    branchId?: number;
    is_default?: boolean;
    isDefault?: boolean;
    enabled?: boolean;
    status?: boolean;
    ind_active?: boolean;
}
export declare class CreateUnifiedItemDto {
    companyId?: number;
    code?: string;
    sku?: string;
    name: string;
    description?: string;
    item_type: string;
    product_category_id?: number;
    productCategoryId?: number;
    category_name?: string;
    unit_measure?: string;
    sale_price?: number;
    purchase_price?: number;
    tax_rate?: number;
    ind_active?: boolean;
    warehouse_id?: number;
    initial_stock?: number;
}
export declare class UpdateUnifiedItemDto {
    companyId?: number;
    code?: string;
    sku?: string;
    name?: string;
    description?: string;
    item_type?: string;
    product_category_id?: number;
    productCategoryId?: number;
    category_name?: string;
    unit_measure?: string;
    sale_price?: number;
    purchase_price?: number;
    tax_rate?: number;
    ind_active?: boolean;
}
export declare class CreateInventoryMovementDto {
    companyId: number;
    warehouseId: number;
    productId: number;
    movement_type: 'IN' | 'OUT';
    movement_reason: 'OPENING' | 'PURCHASE' | 'SALE' | 'CUSTOMER_RETURN' | 'SUPPLIER_RETURN' | 'ADJUSTMENT' | 'TRANSFER' | 'REVERSAL';
    quantity: number;
    unit_cost?: number;
    collection_origin_id?: string;
    collection_origin_name?: string;
    collection_origin_document?: string;
    movement_group_id?: string;
    idempotency_key?: string;
    reversal_of_movement_id?: number;
    created_user_id?: number;
}
export declare class CreateInventoryAdjustmentDto {
    companyId?: number;
    warehouse_id: number;
    product_id: number;
    new_stock: number;
    reason: string;
    unit_cost?: number;
    created_user_id?: number;
}
export declare class CreateInventoryTransferDto {
    companyId?: number;
    from_warehouse_id: number;
    to_warehouse_id: number;
    product_id: number;
    quantity: number;
    notes?: string;
    created_user_id?: number;
}
