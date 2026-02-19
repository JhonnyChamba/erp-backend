import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateRolesTemplatesDto {
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