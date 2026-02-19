import { IsNotEmpty, IsNumber } from "class-validator";

export class UpdatePlansModulesDto {
	@IsNumber()
	@IsNotEmpty()
	planId: number;

	@IsNumber()
	@IsNotEmpty()
	moduleId: number;
}