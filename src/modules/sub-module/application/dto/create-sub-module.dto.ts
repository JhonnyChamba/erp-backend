import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatesubModulesDto {
	@IsNumber()
	@IsNotEmpty()
	moduleId: number;

	@IsString()
	@IsOptional()
	code?: string;

	@IsString()
	@IsNotEmpty()
	desc_icon: string;

	@IsString()
	@IsNotEmpty()
	description: string;

	@IsString()
	@IsNotEmpty()
	url_desc: string;

	@Type(() => Number)
	@IsInt()
	@IsOptional()
	order_index?: number;
}