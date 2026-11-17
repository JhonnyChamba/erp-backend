import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
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
  @IsArray()
  documents?: any[];

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
  @IsArray()
  documents?: any[];

  @IsOptional()
  @IsDateString()
  registrationDate?: string;
}

export class MassPlayerRegistrationItemDto {
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
  @IsString()
  playerClassificationId?: string;

  @IsOptional()
  @IsBoolean()
  isCaptain?: boolean;

  @IsOptional()
  @IsArray()
  documents?: any[];
}

export class MassPlayerRegistrationDto {
  @IsNotEmpty({ message: 'El ID de la inscripción de equipo es obligatorio' })
  @IsString()
  teamRegistrationId: string;

  @IsOptional()
  @IsString()
  stageId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MassPlayerRegistrationItemDto)
  registrations: MassPlayerRegistrationItemDto[];
}

export class UpdatePlayerRegistrationStatusDto {
  @IsNotEmpty({ message: 'El nuevo estado es obligatorio' })
  @IsEnum(PlayerRegistrationStatus)
  status: PlayerRegistrationStatus;

  @IsOptional()
  @IsString()
  comments?: string;
}
