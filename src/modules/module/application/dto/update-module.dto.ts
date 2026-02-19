import { IsOptional } from "class-validator";

export class UpdateModuleDto {
	@IsOptional()
	desc_icon?: string;

	@IsOptional()
	enabled?: boolean;
}