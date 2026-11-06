import { IsOptional } from "class-validator";

export class UpdateModuleDto {
	@IsOptional()
	code?: string;

	@IsOptional()
	desc_icon?: string;

	@IsOptional()
	description?: string;

	@IsOptional()
	enabled?: boolean;
}
