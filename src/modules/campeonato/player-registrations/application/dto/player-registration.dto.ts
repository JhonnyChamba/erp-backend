import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PlayerRegistrationStatus } from '../../../common/enum/campeonato.enum';

export class CreatePlayerRegistrationDto {
  @IsNotEmpty({ message: 'El ID de la inscripción de equipo es obligatorio' })
  @Type(() => Number)
  @IsNumber()
  teamRegistrationId: number;

  @IsNotEmpty({ message: 'El ID del jugador es obligatorio' })
  @Type(() => Number)
  @IsNumber()
  playerId: number;

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
  @Type(() => Number)
  @IsNumber()
  stageId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  playerClassificationId?: number;

  @IsOptional()
  @IsArray()
  documents?: any[];

  @IsOptional()
  @IsDateString()
  registrationDate?: string;
}

export class UpdatePlayerRegistrationDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  teamRegistrationId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  playerId?: number;

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
  @Type(() => Number)
  @IsNumber()
  stageId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  playerClassificationId?: number;

  @IsOptional()
  @IsArray()
  documents?: any[];

  @IsOptional()
  @IsDateString()
  registrationDate?: string;
}

export class MassPlayerRegistrationItemDto {
  @IsNotEmpty({ message: 'El ID del jugador es obligatorio' })
  @Type(() => Number)
  @IsNumber()
  playerId: number;

  @IsNotEmpty({ message: 'El número de camiseta es obligatorio' })
  @IsInt()
  jerseyNumber: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  carnetCode?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  playerClassificationId?: number;

  @IsOptional()
  @IsBoolean()
  isCaptain?: boolean;

  @IsOptional()
  @IsArray()
  documents?: any[];
}

export class MassPlayerRegistrationDto {
  @IsNotEmpty({ message: 'El ID de la inscripción de equipo es obligatorio' })
  @Type(() => Number)
  @IsNumber()
  teamRegistrationId: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  stageId?: number;

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

export class SyncTeamCategoryPlayerItemDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  id?: number;

  @IsNotEmpty({ message: 'El ID del jugador es obligatorio' })
  @Type(() => Number)
  @IsNumber()
  playerId: number;

  @IsNotEmpty({ message: 'El número de camiseta es obligatorio' })
  @Type(() => Number)
  @IsInt()
  jerseyNumber: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  carnetCode?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  playerClassificationId?: number;

  @IsOptional()
  @IsBoolean()
  isCaptain?: boolean;
}

export class SyncTeamCategoryRosterGroupDto {
  @IsNotEmpty({ message: 'El ID de la inscripción de equipo en la categoría es obligatorio' })
  @Type(() => Number)
  @IsNumber()
  teamRegistrationId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SyncTeamCategoryPlayerItemDto)
  players: SyncTeamCategoryPlayerItemDto[];
}

export class SyncTeamEditionRosterDto {
  @IsNotEmpty({ message: 'El ID de la edición del torneo es obligatorio' })
  @Type(() => Number)
  @IsNumber()
  categoryEditionId: number;

  @IsNotEmpty({ message: 'El ID del equipo es obligatorio' })
  @Type(() => Number)
  @IsNumber()
  teamId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SyncTeamCategoryRosterGroupDto)
  categories: SyncTeamCategoryRosterGroupDto[];
}

