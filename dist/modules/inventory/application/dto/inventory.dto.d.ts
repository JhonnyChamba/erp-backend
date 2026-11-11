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
    description?: string;
    enabled?: boolean;
}
export declare class UpdateInventoryCategoryDto {
    companyId?: number;
    code?: string;
    name?: string;
    description?: string;
    enabled?: boolean;
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
}
