import { IsInt, IsOptional } from "class-validator";
import { Type } from "class-transformer";

export class UpdatesubModulesDto {
	@IsOptional()
	moduleId?: number;

	@IsOptional()
	code?: string;

	@IsOptional()
	desc_icon?: string;

	@IsOptional()
	description?: string;

	@IsOptional()
	url_desc?: string;

	@Type(() => Number)
	@IsInt()
	@IsOptional()
	order_index?: number;

	@IsOptional()
	enabled?: boolean;
}
