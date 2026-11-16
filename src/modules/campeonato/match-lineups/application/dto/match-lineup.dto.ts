import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateMatchLineupDto {
  @IsNotEmpty({ message: 'El ID del partido es obligatorio' })
  @IsString()
  matchId: string;

  @IsNotEmpty({ message: 'El ID del equipo es obligatorio' })
  @IsString()
  teamId: string;

  @IsNotEmpty({ message: 'El ID del jugador es obligatorio' })
  @IsString()
  playerId: string;

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
  @IsString()
  matchId?: string;

  @IsOptional()
  @IsString()
  teamId?: string;

  @IsOptional()
  @IsString()
  playerId?: string;

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
