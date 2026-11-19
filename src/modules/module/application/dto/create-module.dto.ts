import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

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

	@Type(() => Number)
	@IsInt()
	@IsOptional()
	order_index?: number;
}