import { IsInt, IsOptional } from "class-validator";
import { Type } from "class-transformer";

export class UpdateModuleDto {
	@IsOptional()
	code?: string;

	@IsOptional()
	desc_icon?: string;

	@IsOptional()
	description?: string;

	@Type(() => Number)
	@IsInt()
	@IsOptional()
	order_index?: number;

	@IsOptional()
	enabled?: boolean;
}
