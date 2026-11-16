import { CompanyExtraDto } from "./company-extra.dto";
export declare class UpdateCompanyDto extends CompanyExtraDto {
    ruc?: string;
    description?: string;
    business_name?: string;
    trade_name?: string;
    enabled?: boolean;
}
