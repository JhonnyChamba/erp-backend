import { CompanyOrmEntity } from 'src/modules/company/infrastructure/persistence/company.orm-entity';
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
    description: string;
    company: CompanyOrmEntity;
    created_by: number;
    enabled: boolean;
    deleted: boolean;
    created_at: Date;
}
export declare class InventoryWarehouseOrmEntity {
    id: number;
    code: string;
    name: string;
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
}
