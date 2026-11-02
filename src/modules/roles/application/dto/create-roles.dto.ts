import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateRolesDto {
	@IsNumber()
	@IsNotEmpty()
	companyId: number;

	@IsString()
	@IsNotEmpty()
	code: string;

	@IsString()
	@IsNotEmpty()
	description: string;

	@IsString()
	@IsOptional()
	address?: string;
}