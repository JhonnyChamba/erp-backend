import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateCategoryDto {
  @IsNotEmpty({ message: 'El nombre de la categoría es obligatorio' })
  @IsString()
  @MaxLength(150)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  acronyms?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  code?: string;

  @IsOptional()
  @IsInt()
  minAge?: number;

  @IsOptional()
  @IsInt()
  maxAge?: number;

  @IsNotEmpty({ message: 'El grupo de división es obligatorio' })
  @Type(() => Number)
  @IsInt({ message: 'El grupo de división debe ser válido' })
  divisionGroupId: number;
}

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  @MaxLength(150)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  acronyms?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  code?: string;

  @IsOptional()
  @IsInt()
  minAge?: number;

  @IsOptional()
  @IsInt()
  maxAge?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El grupo de división debe ser válido' })
  divisionGroupId?: number;
}
