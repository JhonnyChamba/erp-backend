export interface CertInspectionResult {
    valid: boolean;
    expires_at: string;
    issued_at: string;
    subject_name: string;
    issuer_name: string;
    is_expired: boolean;
}
export declare function inspectP12(p12Base64: string, password: string): CertInspectionResult;
