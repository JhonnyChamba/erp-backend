import { IsOptional } from "class-validator";

export class UpdateBranchCompanyDto {
	@IsOptional()
	code?: string;

	@IsOptional()
	name?: string;

	@IsOptional()
	address?: string;

	@IsOptional()
	enabled?: boolean;
}