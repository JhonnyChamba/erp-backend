import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCompanyDto {
	@IsString()
	@IsNotEmpty()
	ruc: string;

	@IsString()
	@IsNotEmpty()
	description: string;

	@IsString()
	@IsNotEmpty()
	business_name: string;

	@IsString()
	@IsNotEmpty()
	trade_name: string;
}