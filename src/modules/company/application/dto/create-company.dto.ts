import { IsNotEmpty, IsString } from 'class-validator';
import { CompanyExtraDto } from './company-extra.dto';

export class CreateCompanyDto extends CompanyExtraDto {
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
