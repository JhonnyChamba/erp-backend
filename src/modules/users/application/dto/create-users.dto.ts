import { IsArray, IsBoolean, IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateUsersDto {
	@IsNumber()
	@IsNotEmpty()
	companyId: number;

	@IsString()
	@IsNotEmpty()
	num_document: string;

	@IsString()
	@IsNotEmpty()
	name_user: string;

	@IsString()
	@IsNotEmpty()
	last_name_user: string;

	@IsString()
	@IsNotEmpty()
	email: string;

	@IsString()
	@IsNotEmpty()
	password: string;

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

	@IsString()
	@IsOptional()
	theme_color?: string;

	@IsDateString({}, { message: 'birth_date debe tener formato AAAA-MM-DD' })
	@IsOptional()
	birth_date?: string | null;
}
