import {
	IsString,
	IsNotEmpty,
	IsOptional,
	IsNumber,
	IsArray,
	ValidateNested,
	IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCreditNoteDetailDto {
	@IsOptional()
	@IsString()
	item_type?: string;

	@IsOptional()
	@IsNumber()
	item_id?: number;

	@IsOptional()
	@IsNumber()
	warehouse_id?: number;

	@IsOptional()
	@IsString()
	code?: string;

	@IsNotEmpty({ message: 'La descripción del ítem es obligatoria.' })
	@IsString()
	description: string;

	@IsNotEmpty({ message: 'La cantidad es obligatoria.' })
	@IsNumber({}, { message: 'La cantidad debe ser numérica.' })
	quantity: number;

	@IsNotEmpty({ message: 'El precio unitario es obligatorio.' })
	@IsNumber({}, { message: 'El precio debe ser numérico.' })
	unit_price: number;

	@IsOptional()
	@IsNumber()
	discount?: number;

	@IsOptional()
	@IsNumber()
	tax_rate?: number;
}

export class CreateCreditNoteDto {
	@IsOptional()
	@IsNumber()
	invoiceId?: number;

	@IsNotEmpty({ message: 'La sucursal es requerida.' })
	@IsNumber()
	branchId: number;

	@IsOptional()
	@IsString()
	emission_point?: string;

	@IsOptional()
	@IsString()
	issue_date?: string;

	@IsOptional()
	@IsString()
	modified_document_type?: string;

	@IsNotEmpty({ message: 'El número de comprobante modificado es obligatorio (ej. 001-001-000000001).' })
	@IsString()
	modified_document_number: string;

	@IsOptional()
	@IsString()
	modified_document_date?: string;

	@IsNotEmpty({ message: 'El motivo de emisión de la nota de crédito es obligatorio según el SRI.' })
	@IsString()
	reason: string;

	@IsOptional()
	@IsString()
	customer_id_type?: string;

	@IsOptional()
	@IsString()
	customer_id_number?: string;

	@IsOptional()
	@IsString()
	customer_name?: string;

	@IsOptional()
	@IsString()
	customer_address?: string;

	@IsOptional()
	@IsString()
	customer_email?: string;

	@IsOptional()
	@IsString()
	customer_phone?: string;

	@IsOptional()
	@IsBoolean()
	adjust_inventory?: boolean;

	@IsOptional()
	@IsString()
	notes?: string;

	@IsArray({ message: 'Los detalles deben ser una lista.' })
	@ValidateNested({ each: true })
	@Type(() => CreateCreditNoteDetailDto)
	details: CreateCreditNoteDetailDto[];
}

