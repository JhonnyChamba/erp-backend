import { CompanyFiscalData, CompanySecretsInput } from '../domain/entities/company.entity';
export declare function splitCompanyExtra(dto: any): {
    fiscal: CompanyFiscalData;
    secrets: CompanySecretsInput;
};
