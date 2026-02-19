import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreatesubModulesDto {
	@IsNumber()
	@IsNotEmpty()
	moduleId: number;

	@IsString()
	@IsNotEmpty()
	code: string;

	@IsString()
	@IsNotEmpty()
	desc_icon: string;

	@IsString()
	@IsNotEmpty()
	description: string;

	@IsString()
	@IsNotEmpty()
	url_desc: string;
}