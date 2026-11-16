import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { MatchEventType } from '../../../common/enum/campeonato.enum';

export class CreateMatchEventDto {
  @IsNotEmpty({ message: 'El ID del partido es obligatorio' })
  @IsString()
  matchId: string;

  @IsNotEmpty({ message: 'El ID del equipo es obligatorio' })
  @IsString()
  teamId: string;

  @IsNotEmpty({ message: 'El ID del jugador es obligatorio' })
  @IsString()
  playerId: string;

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
  @IsString()
  playerOutId?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateMatchEventDto {
  @IsOptional()
  @IsString()
  matchId?: string;

  @IsOptional()
  @IsString()
  teamId?: string;

  @IsOptional()
  @IsString()
  playerId?: string;

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
  @IsString()
  playerOutId?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
