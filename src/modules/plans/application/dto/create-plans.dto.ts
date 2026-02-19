import { IsNotEmpty, IsString, IsEnum, IsInt, Min, Matches } from 'class-validator';
import { BillingCycleGeneral } from 'src/common/enum/enum';
import { Type } from 'class-transformer';

export class CreatePlansDto {
	@IsNotEmpty()
	@Matches(/^\d+(\.\d{1,2})?$/, { message: 'El precio debe ser un número válido con hasta 2 decimales' })
	price: string;

	@IsEnum(BillingCycleGeneral)
	billing_cycle: BillingCycleGeneral;

	@IsString()
	@IsNotEmpty()
	description: string;

	@Type(() => Number)
	@IsInt()
	@Min(1)
	max_users: number;

	@Type(() => Number)
	@IsInt()
	@Min(1)
	max_branches: number;
}
