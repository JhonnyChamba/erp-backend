import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateTeamManagementDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  positionId?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  roleTitle?: string;

  @IsNotEmpty({ message: 'El ID del equipo es obligatorio' })
  @Type(() => Number)
  @IsNumber()
  teamId: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  playerId?: number;

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
  @IsString()
  @MaxLength(50)
  cellphone?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(150)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(250)
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  licenseNumber?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateTeamManagementDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  positionId?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  roleTitle?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  teamId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  playerId?: number;

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
  @IsString()
  @MaxLength(50)
  cellphone?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(150)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(250)
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  licenseNumber?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
