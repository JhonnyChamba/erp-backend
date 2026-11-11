export interface CompanyFiscalData {
    address_matriz?: string;
    phone?: string;
    email?: string;
    obligated_accounting?: boolean;
    special_taxpayer?: string;
    tax_regime?: string;
    sri_environment?: string;
    auto_send_sri?: boolean;
    default_establishment?: string;
    default_emission_point?: string;
    cert_file_name?: string;
    cert_expires_at?: string;
    has_certificate?: boolean;
    smtp_host?: string;
    smtp_port?: number;
    smtp_secure?: boolean;
    smtp_user?: string;
    has_smtp_password?: boolean;
    smtp_from_name?: string;
    smtp_from_email?: string;
}
export interface CompanySecretsInput {
    cert_p12_base64?: string;
    cert_password?: string;
    smtp_password?: string;
    remove_certificate?: boolean;
}
export declare class Company {
    readonly id: number | null;
    ruc: string;
    description: string;
    business_name: string;
    trade_name: string;
    enabled: boolean;
    deleted: boolean;
    readonly created_name?: string;
    readonly createdAt?: Date;
    readonly createdById?: number;
    fiscal: CompanyFiscalData;
    secrets: CompanySecretsInput;
    constructor(id: number | null, ruc: string, description: string, business_name: string, trade_name: string, enabled: boolean, deleted: boolean, created_name?: string, createdAt?: Date, createdById?: number, fiscal?: CompanyFiscalData, secrets?: CompanySecretsInput);
}
