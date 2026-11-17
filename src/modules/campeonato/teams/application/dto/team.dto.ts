import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateTeamDto {
  @IsNotEmpty({ message: 'El nombre del equipo es obligatorio' })
  @IsString()
  @MaxLength(150)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  shortName?: string;

  @IsOptional()
  @IsString()
  logo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  color1?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  color2?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  colorAlternate?: string;

  @IsOptional()
  @IsDateString()
  dateOfFoundation?: string;

  @IsNotEmpty({ message: 'Las siglas son obligatorias' })
  @IsString()
  @MaxLength(20)
  acronyms: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(150)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  representativePhone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  neighborhood?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  currentCategoryId?: string;

  @IsOptional()
  @IsString()
  currentSeasonYear?: string;
}

export class UpdateTeamDto {
  @IsOptional()
  @IsString()
  @MaxLength(150)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  shortName?: string;

  @IsOptional()
  @IsString()
  logo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  color1?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  color2?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  colorAlternate?: string;

  @IsOptional()
  @IsDateString()
  dateOfFoundation?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  acronyms?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(150)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  representativePhone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  neighborhood?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  currentCategoryId?: string;

  @IsOptional()
  @IsString()
  currentSeasonYear?: string;
}
