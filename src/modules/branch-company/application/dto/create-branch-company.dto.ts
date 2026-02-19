import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateBranchCompanyDto {
	@IsNumber()
	@IsNotEmpty()
	companyId: number;

	@IsString()
	@IsNotEmpty()
	code: string;

	@IsString()
	@IsNotEmpty()
	name: string;

	@IsString()
	@IsNotEmpty()
	address: string;
}