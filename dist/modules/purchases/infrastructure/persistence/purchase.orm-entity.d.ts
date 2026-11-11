import { CompanyOrmEntity } from 'src/modules/company/infrastructure/persistence/company.orm-entity';
export declare class PurchaseOrmEntity {
    id: number;
    company: CompanyOrmEntity;
    provider_id: number | null;
    provider_name: string;
    provider_id_type: string;
    provider_id_number: string;
    provider_email: string;
    provider_phone: string;
    provider_address: string;
    establishment: string;
    emission_point: string;
    sequential: string;
    invoice_number: string;
    authorization_number: string;
    issue_date: string;
    warehouse_id: number;
    warehouse_name: string;
    branch_id: number | null;
    payment_method: string;
    notes: string;
    status: string;
    subtotal_zero_tax: number;
    subtotal_taxed: number;
    tax_value: number;
    total: number;
    details: PurchaseDetailOrmEntity[];
    created_by: number;
    created_at: Date;
    updated_at: Date;
}
export declare class PurchaseDetailOrmEntity {
    id: number;
    purchase: PurchaseOrmEntity;
    item_type: string;
    item_id: number;
    code: string;
    description: string;
    unit: string;
    quantity: number;
    unit_cost: number;
    tax_rate: number;
    tax_value: number;
    subtotal: number;
    total: number;
}
