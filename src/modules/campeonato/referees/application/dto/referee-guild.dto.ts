import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateRefereeGuildDto {
  @IsNotEmpty({ message: 'La descripción del gremio o núcleo es obligatoria' })
  @IsString()
  @MaxLength(200)
  description: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  acronyms?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateRefereeGuildDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  acronyms?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
