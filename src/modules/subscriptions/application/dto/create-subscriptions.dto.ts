import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsNumber, IsString } from 'class-validator';

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
}