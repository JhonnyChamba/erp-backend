import { CompanyFiscalData, CompanySecretsInput } from '../domain/entities/company.entity';

const FISCAL_KEYS: (keyof CompanyFiscalData)[] = [
	'address_matriz', 'phone', 'email', 'obligated_accounting', 'special_taxpayer', 'tax_regime',
	'sri_environment', 'default_establishment', 'default_emission_point', 'cert_file_name', 'cert_expires_at',
	'smtp_host', 'smtp_port', 'smtp_secure', 'smtp_user', 'smtp_from_name', 'smtp_from_email',
];

// Separa datos públicos (fiscal) de secretos (p12, claves) a partir del DTO
export function splitCompanyExtra(dto: any): { fiscal: CompanyFiscalData; secrets: CompanySecretsInput } {
	const fiscal: any = {};
	for (const k of FISCAL_KEYS) {
		if (dto[k] !== undefined) fiscal[k] = dto[k];
	}
	const secrets: CompanySecretsInput = {};
	if (dto.cert_p12_base64) secrets.cert_p12_base64 = String(dto.cert_p12_base64).replace(/^data:.*?;base64,/, '');
	if (dto.cert_password) secrets.cert_password = dto.cert_password;
	if (dto.smtp_password) secrets.smtp_password = dto.smtp_password;
	if (dto.remove_certificate) secrets.remove_certificate = true;
	return { fiscal, secrets };
}
