import { IsArray, IsBoolean, IsDateString, IsNumber, IsOptional, IsString } from "class-validator";

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

	@IsNumber()
	@IsOptional()
	roleId?: number | null;

	@IsArray()
	@IsOptional()
	companyRoles?: { companyId: number; roleId?: number | null }[];

	@IsBoolean()
	@IsOptional()
	enabled?: boolean;

	@IsString()
	@IsOptional()
	theme_color?: string;

	@IsDateString({}, { message: 'birth_date debe tener formato AAAA-MM-DD' })
	@IsOptional()
	birth_date?: string | null;
}
