import { Type } from "class-transformer";
import { IsDate, IsNotEmpty, IsNumber, IsOptional } from "class-validator";

export class UpdateSubscriptionsDto {
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