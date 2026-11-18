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
import { EditionStatus } from '../../../common/enum/campeonato.enum';

export class EditionCategoryClassificationItemDto {
  @IsNotEmpty({ message: 'El ID de clasificación es obligatorio' })
  @IsString()
  playerClassificationId: string;

  @IsNotEmpty({ message: 'La cantidad máxima de jugadores es obligatoria' })
  @IsInt()
  maxPlayers: number;

  @IsOptional()
  @IsInt()
  maxInactivityMonths?: number;

  @IsOptional()
  @IsInt()
  maxMonths?: number;
}

export class EditionCategoryDetailItemDto {
  @IsNotEmpty({ message: 'El ID de la categoría es obligatorio' })
  @IsString()
  categoryId: string;

  @IsOptional()
  @IsString()
  categoryDescription?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsNumber()
  registrationFee?: number;

  @IsOptional()
  @IsInt()
  maxPlayers?: number;

  @IsOptional()
  @IsInt()
  matchDurationMinutes?: number;

  @IsOptional()
  @IsInt()
  breakDurationMinutes?: number;

  @IsOptional()
  @IsInt()
  waitBetweenMatchesMinutes?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EditionCategoryClassificationItemDto)
  classifications?: EditionCategoryClassificationItemDto[];

  @IsOptional()
  @IsArray()
  stages?: any[];
}

export class CreateCategoryEditionDto {
  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsNotEmpty({ message: 'El nombre de la edición es obligatorio' })
  @IsString()
  @MaxLength(150)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EditionCategoryDetailItemDto)
  categoriesDetail?: EditionCategoryDetailItemDto[];

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsEnum(EditionStatus)
  status?: EditionStatus;

  @IsOptional()
  @IsInt()
  minPlayersPerTeam?: number;

  @IsOptional()
  @IsInt()
  maxPlayersPerTeam?: number;

  @IsOptional()
  @IsInt()
  minPlayersPerMatch?: number;

  @IsOptional()
  @IsNumber()
  registrationFee?: number;

  @IsOptional()
  @IsNumber()
  guaranteeFee?: number;

  @IsOptional()
  @IsInt()
  pointsWin?: number;

  @IsOptional()
  @IsInt()
  pointsDraw?: number;

  @IsOptional()
  @IsInt()
  pointsLoss?: number;

  @IsOptional()
  @IsInt()
  matchDurationMinutes?: number;

  @IsOptional()
  @IsInt()
  breakDurationMinutes?: number;

  @IsOptional()
  @IsInt()
  waitBetweenMatchesMinutes?: number;

  @IsOptional()
  @IsArray()
  availableScenaryIds?: string[];

  @IsOptional()
  @IsBoolean()
  identifyByPlayerCode?: boolean;
}

export class UpdateCategoryEditionDto {
  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EditionCategoryDetailItemDto)
  categoriesDetail?: EditionCategoryDetailItemDto[];

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsEnum(EditionStatus)
  status?: EditionStatus;

  @IsOptional()
  @IsInt()
  minPlayersPerTeam?: number;

  @IsOptional()
  @IsInt()
  maxPlayersPerTeam?: number;

  @IsOptional()
  @IsInt()
  minPlayersPerMatch?: number;

  @IsOptional()
  @IsNumber()
  registrationFee?: number;

  @IsOptional()
  @IsNumber()
  guaranteeFee?: number;

  @IsOptional()
  @IsInt()
  pointsWin?: number;

  @IsOptional()
  @IsInt()
  pointsDraw?: number;

  @IsOptional()
  @IsInt()
  pointsLoss?: number;

  @IsOptional()
  @IsInt()
  matchDurationMinutes?: number;

  @IsOptional()
  @IsInt()
  breakDurationMinutes?: number;

  @IsOptional()
  @IsInt()
  waitBetweenMatchesMinutes?: number;

  @IsOptional()
  @IsArray()
  availableScenaryIds?: string[];

  @IsOptional()
  @IsBoolean()
  identifyByPlayerCode?: boolean;
}
