import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateStageFormatDto {
  @IsNotEmpty({ message: 'El nombre del formato es obligatorio' })
  @IsString()
  @MaxLength(150)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  code?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  formatType?: string;

  @IsOptional()
  @IsInt()
  defaultLaps?: number;

  @IsOptional()
  @IsString()
  defaultTieBreaker?: string;

  @IsOptional()
  @IsBoolean()
  requiresGroups?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateStageFormatDto {
  @IsOptional()
  @IsString()
  @MaxLength(150)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  code?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  formatType?: string;

  @IsOptional()
  @IsInt()
  defaultLaps?: number;

  @IsOptional()
  @IsString()
  defaultTieBreaker?: string;

  @IsOptional()
  @IsBoolean()
  requiresGroups?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
