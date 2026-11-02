import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

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

	@IsString()
	@IsOptional()
	theme_color?: string;
}
