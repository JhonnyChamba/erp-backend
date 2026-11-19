import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateCompetitionTypeDto {
  @IsString({ message: 'La descripción debe ser un texto' })
  @IsNotEmpty({ message: 'La descripción del tipo de competencia es obligatoria' })
  description: string;

  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsOptional()
  observation?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateCompetitionTypeDto {
  @IsString({ message: 'La descripción debe ser un texto' })
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsOptional()
  observation?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
