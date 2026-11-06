import { Type } from 'class-transformer';
import { IsArray, IsDate, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateSubscriptionsDto {
	@IsNumber()
	@IsNotEmpty()
	companyId: number;

	@IsNumber()
	@IsNotEmpty()
	planId: number;

	@IsNotEmpty()
	@IsDate()
	@Type(() => Date)
	begin_date: Date;

	@IsNotEmpty()
	@IsDate()
	@Type(() => Date)
	end_date: Date;

	@IsArray()
	@IsOptional()
	moduleIds?: number[];

	@IsArray()
	@IsOptional()
	subModuleIds?: number[];
}