export declare class CreateCreditNoteDetailDto {
    item_type?: string;
    item_id?: number;
    warehouse_id?: number;
    code?: string;
    description: string;
    quantity: number;
    unit_price: number;
    discount?: number;
    tax_rate?: number;
}
export declare class CreateCreditNoteDto {
    invoiceId?: number;
    branchId: number;
    emission_point?: string;
    issue_date?: string;
    modified_document_type?: string;
    modified_document_number: string;
    modified_document_date?: string;
    reason: string;
    customer_id_type?: string;
    customer_id_number?: string;
    customer_name?: string;
    customer_address?: string;
    customer_email?: string;
    customer_phone?: string;
    adjust_inventory?: boolean;
    notes?: string;
    details: CreateCreditNoteDetailDto[];
}
