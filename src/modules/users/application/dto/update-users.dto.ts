import { IsOptional } from "class-validator";

export class UpdateUsersDto {
	@IsOptional()
	num_document?: string;

	@IsOptional()
	name_user?: string;

	@IsOptional()
	last_name_user?: string;

	@IsOptional()
	email?: string;

	@IsOptional()
	password?: string;

	@IsOptional()
	developer?: boolean;

	@IsOptional()
	multi_company?: boolean;

	@IsOptional()
	enabled?: boolean;

	@IsOptional()
	theme_color?: string;
}