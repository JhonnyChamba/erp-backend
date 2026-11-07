import { IsBoolean, IsOptional, IsString } from "class-validator";
import { CompanyExtraDto } from "./company-extra.dto";

export class UpdateCompanyDto extends CompanyExtraDto {
	@IsOptional()
	@IsString()
	ruc?: string;

	@IsOptional()
	@IsString()
	description?: string;

	@IsOptional()
	@IsString()
	business_name?: string;

	@IsOptional()
	@IsString()
	trade_name?: string;

	@IsOptional()
	@IsBoolean()
	enabled?: boolean;
}
