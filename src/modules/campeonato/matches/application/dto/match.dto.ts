import { Type } from 'class-transformer';
import {
  ArrayMinSize,
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
  Min,
} from 'class-validator';
import { MatchStatus, MeetingType } from '../../../common/enum/campeonato.enum';

export class GenerateFixtureDto {
  // Ediciones con el campeonato iniciado: se genera el fixture de la etapa en proceso de cada categoría
  @IsArray()
  @ArrayMinSize(1, { message: 'Seleccione al menos una edición del torneo' })
  @Type(() => Number)
  @IsInt({ each: true })
  editionIds: number[];
}

export class CreateMatchDto {
  @IsNotEmpty({ message: 'El ID de la etapa es obligatorio' })
  @Type(() => Number)
  @IsNumber()
  stageId: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  scenaryId?: number;

  @IsNotEmpty({ message: 'El equipo local es obligatorio' })
  @Type(() => Number)
  @IsNumber()
  localTeamId: number;

  @IsNotEmpty({ message: 'El equipo visitante es obligatorio' })
  @Type(() => Number)
  @IsNumber()
  awayTeamId: number;

  @IsNotEmpty({ message: 'La fecha es obligatoria' })
  @IsDateString()
  date: string;

  @IsOptional()
  @IsInt()
  roundNumber?: number;

  @IsOptional()
  @IsInt()
  homeGoals?: number;

  @IsOptional()
  @IsInt()
  awayGoals?: number;

  @IsOptional()
  @IsInt()
  homeExtraGoals?: number;

  @IsOptional()
  @IsInt()
  awayExtraGoals?: number;

  @IsOptional()
  @IsInt()
  homePenalties?: number;

  @IsOptional()
  @IsInt()
  awayPenalties?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  winnerTeamId?: number;

  @IsOptional()
  @IsEnum(MatchStatus)
  status?: MatchStatus;

  @IsOptional()
  @IsEnum(MeetingType)
  meetingType?: MeetingType;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  llaveId?: string;

  @IsOptional()
  @IsBoolean()
  isWalkover?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  refereeId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  vocalId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  vocalTeamId?: number;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  vocalMemberName?: string;

  @IsOptional()
  @IsString()
  vocalObservations?: string;

  @IsOptional()
  @IsString()
  refereeObservations?: string;
}

export class UpdateMatchDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  stageId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  scenaryId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  localTeamId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  awayTeamId?: number;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsInt()
  roundNumber?: number;

  @IsOptional()
  @IsInt()
  homeGoals?: number;

  @IsOptional()
  @IsInt()
  awayGoals?: number;

  @IsOptional()
  @IsInt()
  homeExtraGoals?: number;

  @IsOptional()
  @IsInt()
  awayExtraGoals?: number;

  @IsOptional()
  @IsInt()
  homePenalties?: number;

  @IsOptional()
  @IsInt()
  awayPenalties?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  winnerTeamId?: number;

  @IsOptional()
  @IsEnum(MatchStatus)
  status?: MatchStatus;

  @IsOptional()
  @IsEnum(MeetingType)
  meetingType?: MeetingType;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  llaveId?: string;

  @IsOptional()
  @IsBoolean()
  isWalkover?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  refereeId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  vocalId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  vocalTeamId?: number;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  vocalMemberName?: string;

  @IsOptional()
  @IsString()
  vocalObservations?: string;

  @IsOptional()
  @IsString()
  refereeObservations?: string;
}
