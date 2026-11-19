import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { SanctionType, SanctionStatus } from '../../../common/enum/campeonato.enum';

export class CreateSanctionDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  matchId?: number;

  @IsNotEmpty({ message: 'El ID del jugador es obligatorio' })
  @Type(() => Number)
  @IsNumber()
  playerId: number;

  @IsNotEmpty({ message: 'El tipo de sanción es obligatorio' })
  @IsEnum(SanctionType)
  type: SanctionType;

  @IsOptional()
  @IsNumber()
  matchesSuspended?: number;

  @IsOptional()
  @IsNumber()
  matchesServed?: number;

  @IsOptional()
  @IsNumber()
  fineAmount?: number;

  @IsOptional()
  @IsEnum(SanctionStatus)
  status?: SanctionStatus;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateSanctionDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  matchId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  playerId?: number;

  @IsOptional()
  @IsEnum(SanctionType)
  type?: SanctionType;

  @IsOptional()
  @IsNumber()
  matchesSuspended?: number;

  @IsOptional()
  @IsNumber()
  matchesServed?: number;

  @IsOptional()
  @IsNumber()
  fineAmount?: number;

  @IsOptional()
  @IsEnum(SanctionStatus)
  status?: SanctionStatus;

  @IsOptional()
  @IsString()
  description?: string;
}
