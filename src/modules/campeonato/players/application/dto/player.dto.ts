import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Gender, DominantFoot } from '../../../common/enum/campeonato.enum';

export class CreatePlayerDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  code?: string;

  @IsOptional()
  @IsInt()
  ageYears?: number;

  @IsOptional()
  @IsInt()
  ageMonths?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  demarcationId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  playerClassificationId?: number;

  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @IsString()
  @MaxLength(100)
  name: string;

  @IsNotEmpty({ message: 'El apellido es obligatorio' })
  @IsString()
  @MaxLength(100)
  lastName: string;

  @IsNotEmpty({ message: 'La identificación es obligatoria' })
  @IsString()
  @MaxLength(50)
  identification: string;

  @IsOptional()
  @IsBoolean()
  isForeigner?: boolean;

  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsInt()
  jerseyNumber?: number;

  @IsOptional()
  @IsString()
  @MaxLength(250)
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(150)
  email?: string;

  @IsOptional()
  @IsString()
  photo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  bloodType?: string;

  @IsOptional()
  @IsEnum(DominantFoot)
  dominantFoot?: DominantFoot;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  emergencyContactName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  emergencyContactPhone?: string;

  @IsOptional()
  @IsDateString()
  medicalClearanceExpiry?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  currentTeamId?: number;

  @IsOptional()
  @IsString()
  passOwnerType?: string; // 'PLAYER' | 'TEAM'

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  passOwnerTeamId?: number;
}

export class UpdatePlayerDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  code?: string;

  @IsOptional()
  @IsInt()
  ageYears?: number;

  @IsOptional()
  @IsInt()
  ageMonths?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  demarcationId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  playerClassificationId?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  identification?: string;

  @IsOptional()
  @IsBoolean()
  isForeigner?: boolean;

  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsInt()
  jerseyNumber?: number;

  @IsOptional()
  @IsString()
  @MaxLength(250)
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(150)
  email?: string;

  @IsOptional()
  @IsString()
  photo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  bloodType?: string;

  @IsOptional()
  @IsEnum(DominantFoot)
  dominantFoot?: DominantFoot;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  emergencyContactName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  emergencyContactPhone?: string;

  @IsOptional()
  @IsDateString()
  medicalClearanceExpiry?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  currentTeamId?: number;

  @IsOptional()
  @IsString()
  passOwnerType?: string; // 'PLAYER' | 'TEAM'

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  passOwnerTeamId?: number;
}
