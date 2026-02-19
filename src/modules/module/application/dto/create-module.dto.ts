import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateModuleDto {
	@IsString()
	@IsNotEmpty()
	code: string;

	@IsString()
	@IsNotEmpty()
	desc_icon: string;

	@IsString()
	@IsNotEmpty()
	description: string;
}