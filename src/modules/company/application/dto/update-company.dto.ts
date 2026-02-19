import { IsOptional } from "class-validator";

export class UpdateCompanyDto {
	@IsOptional()
	ruc?: string;

	@IsOptional()
	description?: string;

	@IsOptional()
	business_name?: string;

	@IsOptional()
	trade_name?: string;

	@IsOptional()
	enabled?: boolean;
}