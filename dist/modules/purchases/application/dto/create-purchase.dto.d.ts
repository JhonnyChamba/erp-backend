export declare class CreatePurchaseDetailDto {
    item_type?: string;
    item_id?: number;
    itemId?: number;
    code?: string;
    description: string;
    unit?: string;
    quantity: number;
    unit_cost: number;
    unitCost?: number;
    tax_rate?: number;
    taxRate?: number;
}
export declare class CreatePurchaseDto {
    companyId?: number;
    company_id?: number;
    provider_id?: number;
    providerId?: number;
    provider_name: string;
    providerName?: string;
    provider_id_type?: string;
    provider_id_number: string;
    providerIdNumber?: string;
    provider_email?: string;
    provider_phone?: string;
    provider_address?: string;
    establishment: string;
    emission_point: string;
    sequential: string;
    invoice_number?: string;
    authorization_number?: string;
    issue_date: string;
    warehouse_id: number;
    warehouseId?: number;
    branch_id?: number;
    payment_method?: string;
    notes?: string;
    items: CreatePurchaseDetailDto[];
}
