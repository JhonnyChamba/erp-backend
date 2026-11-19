import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { TeamOrigin, StageFormat, IntersectionType } from '../../../common/enum/campeonato.enum';

export class CreateStageDto {
  @IsNotEmpty({ message: 'El ID de la edición es obligatorio' })
  @Type(() => Number)
  @IsNumber()
  categoryEditionId: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  categoryId?: number;

  @IsNotEmpty({ message: 'El nombre de la etapa es obligatorio' })
  @IsString()
  @MaxLength(150)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  stageOrder?: number;

  @IsOptional()
  @IsEnum(TeamOrigin)
  teamOrigin?: TeamOrigin;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  previousStageId?: number;

  @IsOptional()
  @IsInt()
  numberOfExpectedTeams?: number;

  @IsOptional()
  @IsEnum(StageFormat)
  format?: StageFormat;

  @IsOptional()
  @IsInt()
  numberOfLaps?: number;

  @IsOptional()
  @IsInt()
  numberOfGroups?: number;

  @IsOptional()
  @IsEnum(IntersectionType)
  intersectionType?: IntersectionType;

  @IsOptional()
  @IsString()
  tieBreaker?: string;

  @IsOptional()
  bonusPoints?: any;

  @IsOptional()
  predefinedCrosses?: any;

  @IsOptional()
  @IsInt()
  matchDurationMinutes?: number;

  @IsOptional()
  @IsInt()
  maxPlayersPerTeam?: number;

  @IsOptional()
  @IsBoolean()
  allowExtraTime?: boolean;

  @IsOptional()
  @IsBoolean()
  allowPenalties?: boolean;
}

export class UpdateStageDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  categoryEditionId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  categoryId?: number;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  stageOrder?: number;

  @IsOptional()
  @IsEnum(TeamOrigin)
  teamOrigin?: TeamOrigin;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  previousStageId?: number;

  @IsOptional()
  @IsInt()
  numberOfExpectedTeams?: number;

  @IsOptional()
  @IsEnum(StageFormat)
  format?: StageFormat;

  @IsOptional()
  @IsInt()
  numberOfLaps?: number;

  @IsOptional()
  @IsInt()
  numberOfGroups?: number;

  @IsOptional()
  @IsEnum(IntersectionType)
  intersectionType?: IntersectionType;

  @IsOptional()
  @IsString()
  tieBreaker?: string;

  @IsOptional()
  bonusPoints?: any;

  @IsOptional()
  predefinedCrosses?: any;

  @IsOptional()
  @IsInt()
  matchDurationMinutes?: number;

  @IsOptional()
  @IsInt()
  maxPlayersPerTeam?: number;

  @IsOptional()
  @IsBoolean()
  allowExtraTime?: boolean;

  @IsOptional()
  @IsBoolean()
  allowPenalties?: boolean;
}

export class CreateStagePlayerClassificationDto {
  @IsNotEmpty({ message: 'La clasificación de futbolista es obligatoria' })
  @Type(() => Number)
  @IsNumber()
  playerClassificationId: number;

  @IsNotEmpty({ message: 'La cantidad máxima permitida es obligatoria' })
  @IsInt({ message: 'El cupo debe ser un número entero' })
  maxPlayers: number;
}

export class UpdateStagePlayerClassificationDto {
  @IsOptional()
  @IsInt({ message: 'El cupo debe ser un número entero' })
  maxPlayers?: number;
}
