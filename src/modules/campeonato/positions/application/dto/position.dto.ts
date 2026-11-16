import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { PositionScope } from '../../../common/enum/campeonato.enum';

export class CreatePositionDto {
  @IsNotEmpty({ message: 'El nombre del cargo es obligatorio' })
  @IsString()
  @MaxLength(150)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  code?: string;

  @IsOptional()
  @IsEnum(PositionScope)
  scope?: PositionScope;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdatePositionDto {
  @IsOptional()
  @IsString()
  @MaxLength(150)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  code?: string;

  @IsOptional()
  @IsEnum(PositionScope)
  scope?: PositionScope;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
