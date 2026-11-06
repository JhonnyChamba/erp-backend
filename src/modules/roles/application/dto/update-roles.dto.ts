import { IsArray, IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";

export class UpdateRolesDto {
	@IsNumber()
	@IsOptional()
	companyId?: number;

	@IsString()
	@IsOptional()
	code?: string;

	@IsString()
	@IsOptional()
	description?: string;

	@IsString()
	@IsOptional()
	name?: string;

	@IsString()
	@IsOptional()
	address?: string;

	@IsBoolean()
	@IsOptional()
	enabled?: boolean;

	@IsArray()
	@IsOptional()
	moduleIds?: number[];

	@IsArray()
	@IsOptional()
	subModuleIds?: number[];

	@IsArray()
	@IsOptional()
	details?: { moduleId?: number | null; subModuleId?: number | null; hasAccess: boolean }[];
}