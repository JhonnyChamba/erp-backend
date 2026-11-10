export declare const CONTACT_STATES: string[];
export declare const DOCUMENT_TYPES: string[];
export declare const PAYMENT_TERMS: string[];
declare class ContactBaseDto {
    tipo_documento?: string;
    num_document?: string;
    email?: string;
    telefono?: string;
    direccion?: string;
    estado?: string;
}
export declare class CustomerDto extends ContactBaseDto {
    razon_social?: string;
    nombre_comercial?: string;
    ciudad?: string;
}
export declare class ProviderDto extends ContactBaseDto {
    razon_social?: string;
    nombre_comercial?: string;
    forma_pago?: string;
    banco?: string;
    num_cuenta?: string;
}
export declare class SellerDto extends ContactBaseDto {
    nombres?: string;
    apellidos?: string;
    comision_pct?: number;
}
export {};
