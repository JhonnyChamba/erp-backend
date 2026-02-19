import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreatePermissionsTemplatesDto {
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