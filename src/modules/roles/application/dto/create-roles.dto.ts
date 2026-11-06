import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateRolesDto {
	@IsNumber()
	@IsNotEmpty()
	companyId: number;

	@IsString()
	@IsOptional()
	code?: string;

	@IsString()
	@IsNotEmpty()
	description: string;

	@IsString()
	@IsOptional()
	address?: string;

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