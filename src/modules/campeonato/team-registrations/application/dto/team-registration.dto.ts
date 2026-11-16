import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { RegistrationStatus, PaymentStatus } from '../../../common/enum/campeonato.enum';

export class CreateTeamRegistrationDto {
  @IsNotEmpty({ message: 'El ID de la edición es obligatorio' })
  @IsString()
  categoryEditionId: string;

  @IsNotEmpty({ message: 'El ID del equipo es obligatorio' })
  @IsString()
  teamId: string;

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
  @IsString()
  categoryEditionId?: string;

  @IsOptional()
  @IsString()
  teamId?: string;

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
