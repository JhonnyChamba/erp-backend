import { IsBoolean, IsIn, IsInt, IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

// Campos fiscales / firma / correo compartidos por crear y editar empresa
export class CompanyExtraDto {
	@IsOptional() @IsString() @MaxLength(250) address_matriz?: string;
	@IsOptional() @IsString() @MaxLength(30) phone?: string;
	@IsOptional() @IsString() @MaxLength(150) email?: string;
	@IsOptional() @IsBoolean() obligated_accounting?: boolean;
	@IsOptional() @IsString() @MaxLength(20) special_taxpayer?: string;
	@IsOptional() @IsString() @MaxLength(60) tax_regime?: string;
	@IsOptional() @IsIn(['1', '2']) sri_environment?: string;
	@IsOptional() @Matches(/^\d{3}$/) default_establishment?: string;
	@IsOptional() @Matches(/^\d{3}$/) default_emission_point?: string;

	// Firma electrónica
	@IsOptional() @IsString() cert_p12_base64?: string;
	@IsOptional() @IsString() cert_password?: string;
	@IsOptional() @IsString() @MaxLength(150) cert_file_name?: string;
	@IsOptional() @IsString() cert_expires_at?: string;
	@IsOptional() @IsBoolean() remove_certificate?: boolean;

	// SMTP
	@IsOptional() @IsString() @MaxLength(150) smtp_host?: string;
	@IsOptional() @Type(() => Number) @IsInt() smtp_port?: number;
	@IsOptional() @IsBoolean() smtp_secure?: boolean;
	@IsOptional() @IsString() @MaxLength(150) smtp_user?: string;
	@IsOptional() @IsString() smtp_password?: string;
	@IsOptional() @IsString() @MaxLength(150) smtp_from_name?: string;
	@IsOptional() @IsString() @MaxLength(150) smtp_from_email?: string;
}

