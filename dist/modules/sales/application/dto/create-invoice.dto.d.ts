export declare class CreateInvoiceDetailDto {
    item_type?: string;
    item_id?: number;
    code?: string;
    description: string;
    quantity: number;
    unit_price: number;
    discount?: number;
    tax_rate?: number;
}
export declare class CreateInvoiceDto {
    companyId?: number;
    establishment?: string;
    emission_point?: string;
    issue_date?: string;
    customer_id_type: string;
    customer_id_number: string;
    customer_name: string;
    customer_address?: string;
    customer_email?: string;
    customer_phone?: string;
    payment_method?: string;
    notes?: string;
    details: CreateInvoiceDetailDto[];
}
