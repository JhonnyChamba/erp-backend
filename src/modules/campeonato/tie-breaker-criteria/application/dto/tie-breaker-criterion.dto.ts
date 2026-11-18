import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateTieBreakerCriterionDto {
  @IsString({ message: 'La descripción debe ser un texto' })
  @IsNotEmpty({ message: 'La descripción del criterio de desempate es obligatoria' })
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

export class UpdateTieBreakerCriterionDto {
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
