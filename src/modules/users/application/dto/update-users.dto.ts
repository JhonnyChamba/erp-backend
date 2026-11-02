import { IsArray, IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";

export class UpdateUsersDto {
	@IsNumber()
	@IsOptional()
	companyId?: number;

	@IsString()
	@IsOptional()
	num_document?: string;

	@IsString()
	@IsOptional()
	name_user?: string;

	@IsString()
	@IsOptional()
	last_name_user?: string;

	@IsString()
	@IsOptional()
	email?: string;

	@IsString()
	@IsOptional()
	password?: string;

	@IsBoolean()
	@IsOptional()
	developer?: boolean;

	@IsBoolean()
	@IsOptional()
	super_admin?: boolean;

	@IsBoolean()
	@IsOptional()
	multi_company?: boolean;

	@IsArray()
	@IsOptional()
	companyIds?: number[];

	@IsBoolean()
	@IsOptional()
	enabled?: boolean;

	@IsString()
	@IsOptional()
	theme_color?: string;
}
