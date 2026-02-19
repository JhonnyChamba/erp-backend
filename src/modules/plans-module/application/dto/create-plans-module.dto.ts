import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreatePlansModulesDto {
	@IsNumber()
	@IsNotEmpty()
	planId: number;

	@IsNumber()
	@IsNotEmpty()
	moduleId: number;
}