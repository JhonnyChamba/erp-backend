import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { PlayerRegistrationStatus } from '../../../common/enum/campeonato.enum';

export class CreatePlayerRegistrationDto {
  @IsNotEmpty({ message: 'El ID de la inscripción de equipo es obligatorio' })
  @IsString()
  teamRegistrationId: string;

  @IsNotEmpty({ message: 'El ID del jugador es obligatorio' })
  @IsString()
  playerId: string;

  @IsNotEmpty({ message: 'El número de camiseta es obligatorio' })
  @IsInt()
  jerseyNumber: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  carnetCode?: string;

  @IsOptional()
  @IsEnum(PlayerRegistrationStatus)
  status?: PlayerRegistrationStatus;

  @IsOptional()
  @IsBoolean()
  isCaptain?: boolean;

  @IsOptional()
  @IsString()
  stageId?: string;

  @IsOptional()
  @IsString()
  playerClassificationId?: string;

  @IsOptional()
  @IsDateString()
  registrationDate?: string;
}

export class UpdatePlayerRegistrationDto {
  @IsOptional()
  @IsString()
  teamRegistrationId?: string;

  @IsOptional()
  @IsString()
  playerId?: string;

  @IsOptional()
  @IsInt()
  jerseyNumber?: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  carnetCode?: string;

  @IsOptional()
  @IsEnum(PlayerRegistrationStatus)
  status?: PlayerRegistrationStatus;

  @IsOptional()
  @IsBoolean()
  isCaptain?: boolean;

  @IsOptional()
  @IsString()
  stageId?: string;

  @IsOptional()
  @IsString()
  playerClassificationId?: string;

  @IsOptional()
  @IsDateString()
  registrationDate?: string;
}
