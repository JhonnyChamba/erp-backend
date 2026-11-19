import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateCompetitionLapDto {
  @IsString({ message: 'La descripción debe ser un texto' })
  @IsNotEmpty({ message: 'La descripción de la vuelta/modalidad es obligatoria' })
  description: string;

  @IsString()
  @IsOptional()
  code?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  numberOfLaps?: number;

  @IsString()
  @IsOptional()
  observation?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateCompetitionLapDto {
  @IsString({ message: 'La descripción debe ser un texto' })
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  code?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  numberOfLaps?: number;

  @IsString()
  @IsOptional()
  observation?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
