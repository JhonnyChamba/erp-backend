import { Type } from "class-transformer";
import { IsArray, IsBoolean, IsDate, IsNotEmpty, IsNumber, IsOptional } from "class-validator";

export class UpdateSubscriptionsDto {
	@IsNumber()
	@IsNotEmpty()
	companyId: number;

	@IsNumber()
	@IsOptional()
	planId?: number;

	@IsOptional()
	@IsDate()
	@Type(() => Date)
	begin_date?: Date;

	@IsOptional()
	@IsDate()
	@Type(() => Date)
	end_date?: Date;

	@IsBoolean()
	@IsOptional()
	enabled?: boolean;

	@IsArray()
	@IsOptional()
	moduleIds?: number[];

	@IsArray()
	@IsOptional()
	subModuleIds?: number[];
}