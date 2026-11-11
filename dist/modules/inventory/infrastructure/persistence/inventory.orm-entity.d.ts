import { CompanyOrmEntity } from '../../../company/infrastructure/persistence/company.orm-entity';
export declare class InventoryItemOrmEntity {
    id: number;
    code: string;
    sku: string;
    name: string;
    category_id: number;
    category: string;
    unit_measure: string;
    cost_price: number;
    sale_price: number;
    tax_rate: number;
    stock_current: number;
    stock_min: number;
    warehouse_id: number;
    warehouse_location: string;
    description: string;
    company: CompanyOrmEntity;
    created_by: number;
    enabled: boolean;
    deleted: boolean;
    created_at: Date;
}
export declare class InventoryServiceOrmEntity {
    id: number;
    code: string;
    name: string;
    category: string;
    billing_unit: string;
    base_cost: number;
    sale_price: number;
    tax_rate: number;
    estimated_duration: string;
    description: string;
    company: CompanyOrmEntity;
    created_by: number;
    enabled: boolean;
    deleted: boolean;
    created_at: Date;
}
export declare class InventorySubcontractOrmEntity {
    id: number;
    code: string;
    name: string;
    specialty_area: string;
    contractor_name: string;
    contractor_ruc: string;
    unit_measure: string;
    unit_cost: number;
    suggested_price: number;
    tax_rate: number;
    includes_materials: boolean;
    description: string;
    company: CompanyOrmEntity;
    created_by: number;
    enabled: boolean;
    deleted: boolean;
    created_at: Date;
}
export declare class InventoryCategoryOrmEntity {
    id: number;
    code: string;
    name: string;
    category_type: string;
    description: string;
    company: CompanyOrmEntity;
    created_by: number;
    enabled: boolean;
    deleted: boolean;
    created_at: Date;
    updated_at: Date;
}
export { InventoryCategoryOrmEntity as ProductCategoryOrmEntity };
export declare class InventoryWarehouseOrmEntity {
    id: number;
    code: string;
    name: string;
    description: string;
    address: string;
    responsible: string;
    phone: string;
    branch_id: number;
    is_default: boolean;
    company: CompanyOrmEntity;
    created_by: number;
    enabled: boolean;
    deleted: boolean;
    created_at: Date;
    updated_at: Date;
}
export { InventoryWarehouseOrmEntity as WarehouseOrmEntity };
export declare class ItemOrmEntity {
    id: number;
    company: CompanyOrmEntity;
    code: string;
    sku: string;
    name: string;
    description: string;
    item_type: string;
    category: InventoryCategoryOrmEntity;
    product_category_id: number;
    category_name: string;
    unit_measure: string;
    sale_price: number;
    purchase_price: number;
    tax_rate: number;
    ind_active: boolean;
    deleted: boolean;
    created_at: Date;
    updated_at: Date;
}
export declare class InventoryBalanceOrmEntity {
    id: number;
    company: CompanyOrmEntity;
    warehouse: InventoryWarehouseOrmEntity;
    product: ItemOrmEntity;
    stock: number;
    reserved_stock: number;
    average_cost: number;
    created_at: Date;
    updated_at: Date;
}
export declare class InventoryMovementOrmEntity {
    id: number;
    company: CompanyOrmEntity;
    warehouse: InventoryWarehouseOrmEntity;
    product: ItemOrmEntity;
    product_code: string;
    product_name: string;
    movement_type: string;
    movement_reason: string;
    quantity: number;
    unit_cost: number;
    total_cost: number;
    stock_after: number;
    collection_origin_id: string;
    collection_origin_name: string;
    collection_origin_document: string;
    movement_group_id: string;
    idempotency_key: string;
    reversal_of_movement_id: number;
    movement_at: Date;
    created_user_id: number;
    created_at: Date;
}
