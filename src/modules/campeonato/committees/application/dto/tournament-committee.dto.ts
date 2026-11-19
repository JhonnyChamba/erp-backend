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

export class CreateTournamentCommitteeDto {
  @IsNotEmpty({ message: 'El ID de la posición/cargo es obligatorio' })
  @Type(() => Number)
  @IsNumber()
  positionId: number;

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
  photo?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateTournamentCommitteeDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  positionId?: number;

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
  photo?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
