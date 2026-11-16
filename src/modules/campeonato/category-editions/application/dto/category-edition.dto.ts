import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { EditionStatus } from '../../../common/enum/campeonato.enum';

export class CreateCategoryEditionDto {
  @IsNotEmpty({ message: 'El ID de la categoría es obligatorio' })
  @IsString()
  categoryId: string;

  @IsNotEmpty({ message: 'El nombre de la edición es obligatorio' })
  @IsString()
  @MaxLength(150)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

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
}
