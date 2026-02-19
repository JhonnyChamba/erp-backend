import { IsOptional } from "class-validator";

export class UpdateRolesTemplatesDto {
	@IsOptional()
	code?: string;

	@IsOptional()
	name?: string;

	@IsOptional()
	address?: string;

	@IsOptional()
	enabled?: boolean;
}