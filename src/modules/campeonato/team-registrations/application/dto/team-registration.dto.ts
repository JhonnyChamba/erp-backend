import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { RegistrationStatus, PaymentStatus } from '../../../common/enum/campeonato.enum';

export class CreateTeamRegistrationDto {
  @IsNotEmpty({ message: 'El ID de la edición es obligatorio' })
  @Type(() => Number)
  @IsNumber()
  categoryEditionId: number;

  @IsNotEmpty({ message: 'El ID del equipo es obligatorio' })
  @Type(() => Number)
  @IsNumber()
  teamId: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  groupName?: string;

  @IsOptional()
  @IsEnum(RegistrationStatus)
  status?: RegistrationStatus;

  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @IsOptional()
  @IsInt()
  pointsPenalty?: number;
}

export class UpdateTeamRegistrationDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  categoryEditionId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  teamId?: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  groupName?: string;

  @IsOptional()
  @IsEnum(RegistrationStatus)
  status?: RegistrationStatus;

  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @IsOptional()
  @IsInt()
  pointsPenalty?: number;
}
