import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateDocumentTypeDto {
	@IsNotEmpty({ message: 'El nombre del tipo de documento es obligatorio' })
	@IsString()
	name: string;

	@IsNotEmpty({ message: 'El tipo es obligatorio (CLIENTE, PROVEEDOR, VENDEDOR, TODOS)' })
	@IsString()
	type: string;

	@IsNotEmpty({ message: 'El código es obligatorio' })
	@IsString()
	code: string;

	@IsOptional()
	@IsString()
	status?: string;
}

export class UpdateDocumentTypeDto {
	@IsOptional()
	@IsString()
	name?: string;

	@IsOptional()
	@IsString()
	type?: string;

	@IsOptional()
	@IsString()
	code?: string;

	@IsOptional()
	@IsString()
	status?: string;
}

