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
import { MatchStatus, MeetingType } from '../../../common/enum/campeonato.enum';

export class CreateMatchDto {
  @IsNotEmpty({ message: 'El ID de la etapa es obligatorio' })
  @IsString()
  stageId: string;

  @IsOptional()
  @IsString()
  scenaryId?: string;

  @IsNotEmpty({ message: 'El equipo local es obligatorio' })
  @IsString()
  localTeamId: string;

  @IsNotEmpty({ message: 'El equipo visitante es obligatorio' })
  @IsString()
  awayTeamId: string;

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
  @IsString()
  winnerTeamId?: string;

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
  @IsString()
  refereeId?: string;

  @IsOptional()
  @IsString()
  vocalId?: string;

  @IsOptional()
  @IsString()
  vocalTeamId?: string;

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
  @IsString()
  stageId?: string;

  @IsOptional()
  @IsString()
  scenaryId?: string;

  @IsOptional()
  @IsString()
  localTeamId?: string;

  @IsOptional()
  @IsString()
  awayTeamId?: string;

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
  @IsString()
  winnerTeamId?: string;

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
  @IsString()
  refereeId?: string;

  @IsOptional()
  @IsString()
  vocalId?: string;

  @IsOptional()
  @IsString()
  vocalTeamId?: string;

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
