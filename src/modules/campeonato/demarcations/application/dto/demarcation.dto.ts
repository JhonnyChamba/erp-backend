import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { DemarcationZone } from '../../../common/enum/campeonato.enum';

export class CreateDemarcationDto {
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @IsString()
  @MaxLength(150)
  name: string;

  @IsNotEmpty({ message: 'El código es obligatorio' })
  @IsString()
  @MaxLength(50)
  code: string;

  @IsOptional()
  @IsEnum(DemarcationZone)
  zone?: DemarcationZone;

  @IsOptional()
  @IsInt()
  order?: number;

  @IsOptional()
  @IsInt()
  maxPlayers?: number;
}

export class UpdateDemarcationDto {
  @IsOptional()
  @IsString()
  @MaxLength(150)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  code?: string;

  @IsOptional()
  @IsEnum(DemarcationZone)
  zone?: DemarcationZone;

  @IsOptional()
  @IsInt()
  order?: number;

  @IsOptional()
  @IsInt()
  maxPlayers?: number;
}
