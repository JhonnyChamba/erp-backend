import { Type } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateDivisionGroupDto {
  @IsNotEmpty({ message: 'La descripción es obligatoria' })
  @IsString()
  @MaxLength(200)
  description: string;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}

export class UpdateDivisionGroupDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}

export class ListDivisionGroupDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 50;

  @IsOptional()
  @IsString()
  search?: string;
}
