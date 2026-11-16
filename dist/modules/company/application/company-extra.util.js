"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.splitCompanyExtra = splitCompanyExtra;
const FISCAL_KEYS = [
    'address_matriz', 'phone', 'email', 'obligated_accounting', 'special_taxpayer', 'tax_regime',
    'sri_environment', 'auto_send_sri', 'default_establishment', 'default_emission_point', 'cert_file_name', 'cert_expires_at',
    'smtp_host', 'smtp_port', 'smtp_secure', 'smtp_user', 'smtp_from_name', 'smtp_from_email',
];
function splitCompanyExtra(dto) {
    const fiscal = {};
    for (const k of FISCAL_KEYS) {
        if (dto[k] !== undefined)
            fiscal[k] = dto[k];
    }
    const secrets = {};
    if (dto.cert_p12_base64)
        secrets.cert_p12_base64 = String(dto.cert_p12_base64).replace(/^data:.*?;base64,/, '');
    if (dto.cert_password)
        secrets.cert_password = dto.cert_password;
    if (dto.smtp_password)
        secrets.smtp_password = dto.smtp_password;
    if (dto.remove_certificate)
        secrets.remove_certificate = true;
    return { fiscal, secrets };
}
//# sourceMappingURL=company-extra.util.js.map