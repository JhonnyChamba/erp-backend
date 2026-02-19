import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

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
	@IsNotEmpty()
	address: string;
}