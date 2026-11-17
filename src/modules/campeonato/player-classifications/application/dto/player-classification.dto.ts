import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreatePlayerClassificationDto {
  @IsString()
  @IsNotEmpty()
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

export class UpdatePlayerClassificationDto {
  @IsString()
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
