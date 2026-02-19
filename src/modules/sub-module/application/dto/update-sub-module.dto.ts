import { IsOptional } from "class-validator";

export class UpdatesubModulesDto {
	@IsOptional()
	code?: string;

	@IsOptional()
	desc_icon?: string;

	@IsOptional()
	description?: string;

	@IsOptional()
	url_desc?: string;

	@IsOptional()
	enabled?: boolean;
}