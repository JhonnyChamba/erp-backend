import { IsOptional } from "class-validator";

export class UpdatePermissionsTemplatesDto {
	@IsOptional()
	code?: string;

	@IsOptional()
	name?: string;

	@IsOptional()
	address?: string;

	@IsOptional()
	enabled?: boolean;
}