import { Type } from "class-transformer";
import { IsArray, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Matches, Min } from "class-validator";
import { BillingCycleGeneral } from "src/common/enum/enum";

export class UpdatePlansDto {
	@IsOptional()
	@Matches(/^\d+(\.\d{1,2})?$/, { message: 'El precio debe ser un número válido con hasta 2 decimales' })
	price?: string;

	@IsOptional()
	@IsEnum(BillingCycleGeneral)
	billing_cycle?: BillingCycleGeneral;

	@IsOptional()
	@IsString()
	description?: string;

	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	max_users?: number;

	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	max_branches?: number;

	@IsOptional()
	enabled?: boolean;

	@IsOptional()
	@IsArray()
	moduleIds?: number[];

	@IsOptional()
	@IsArray()
	subModuleIds?: number[];
}