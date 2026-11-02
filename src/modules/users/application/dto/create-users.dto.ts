import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

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

	@IsString()
	theme_color?: string;
}