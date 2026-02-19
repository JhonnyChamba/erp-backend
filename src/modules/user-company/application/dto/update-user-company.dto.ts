import { IsOptional } from "class-validator";

export class UpdateUserCompanyDto {
	@IsOptional()
	enabled?: boolean;
}