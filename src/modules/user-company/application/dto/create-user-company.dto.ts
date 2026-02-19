import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateUserCompanyDto {
	@IsNumber()
	@IsNotEmpty()
	usersId: number;

	@IsNumber()
	@IsNotEmpty()
	companyId: number;
}