import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { MatchEventType } from '../../../common/enum/campeonato.enum';

export class CreateMatchEventDto {
  @IsNotEmpty({ message: 'El ID del partido es obligatorio' })
  @Type(() => Number)
  @IsNumber()
  matchId: number;

  @IsNotEmpty({ message: 'El ID del equipo es obligatorio' })
  @Type(() => Number)
  @IsNumber()
  teamId: number;

  @IsNotEmpty({ message: 'El ID del jugador es obligatorio' })
  @Type(() => Number)
  @IsNumber()
  playerId: number;

  @IsNotEmpty({ message: 'El tipo de evento es obligatorio' })
  @IsEnum(MatchEventType)
  eventType: MatchEventType;

  @IsOptional()
  @IsInt()
  minute?: number;

  @IsOptional()
  @IsInt()
  extraMinute?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  playerOutId?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateMatchEventDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  matchId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  teamId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  playerId?: number;

  @IsOptional()
  @IsEnum(MatchEventType)
  eventType?: MatchEventType;

  @IsOptional()
  @IsInt()
  minute?: number;

  @IsOptional()
  @IsInt()
  extraMinute?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  playerOutId?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
