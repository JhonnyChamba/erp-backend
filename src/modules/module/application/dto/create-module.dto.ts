import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateModuleDto {
	@IsString()
	@IsOptional()
	code?: string;

	@IsString()
	@IsNotEmpty()
	desc_icon: string;

	@IsString()
	@IsNotEmpty()
	description: string;
}