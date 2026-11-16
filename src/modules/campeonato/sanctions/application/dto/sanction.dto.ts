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
  @IsString()
  matchId?: string;

  @IsNotEmpty({ message: 'El ID del jugador es obligatorio' })
  @IsString()
  playerId: string;

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
  @IsString()
  matchId?: string;

  @IsOptional()
  @IsString()
  playerId?: string;

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
