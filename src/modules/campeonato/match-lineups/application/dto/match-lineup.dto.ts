import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateMatchLineupDto {
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

  @IsNotEmpty({ message: 'El número de camiseta es obligatorio' })
  @IsInt()
  jerseyNumber: number;

  @IsOptional()
  @IsBoolean()
  isStarter?: boolean;

  @IsOptional()
  @IsBoolean()
  isCaptain?: boolean;

  @IsOptional()
  @IsBoolean()
  hasPlayed?: boolean;

  @IsOptional()
  @IsInt()
  minutesPlayed?: number;
}

export class UpdateMatchLineupDto {
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
  @IsInt()
  jerseyNumber?: number;

  @IsOptional()
  @IsBoolean()
  isStarter?: boolean;

  @IsOptional()
  @IsBoolean()
  isCaptain?: boolean;

  @IsOptional()
  @IsBoolean()
  hasPlayed?: boolean;

  @IsOptional()
  @IsInt()
  minutesPlayed?: number;
}
