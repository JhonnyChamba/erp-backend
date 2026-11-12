// Datos fiscales / firma / correo. Los secretos nunca se exponen: solo flags.
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
	logo_url?: string;
}

// Datos sensibles que solo viajan hacia la BD (entrada)
export interface CompanySecretsInput {
	cert_p12_base64?: string;
	cert_password?: string;
	smtp_password?: string;
	remove_certificate?: boolean;
}

export class Company {
	constructor(
		public readonly id: number | null,
		public ruc: string,
		public description: string,
		public business_name: string,
		public trade_name: string,
		public enabled: boolean,
		public deleted: boolean,
		public readonly created_name?: string,
		public readonly createdAt?: Date,
		public readonly createdById?: number,
		public fiscal: CompanyFiscalData = {},
		public secrets: CompanySecretsInput = {},
	) { }
}
