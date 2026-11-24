import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { RegistrationStatus, PaymentStatus } from '../../../common/enum/campeonato.enum';

export class CreateTeamRegistrationDto {
  @IsNotEmpty({ message: 'El ID de la edición es obligatorio' })
  @Type(() => Number)
  @IsNumber()
  categoryEditionId: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  categoryId?: number;

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
  categoryId?: number;

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

export class BulkCategoryTeamItemDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  id?: number;

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
  @Type(() => Number)
  @IsInt()
  pointsPenalty?: number;
}

export class BulkCategoryRegistrationGroupDto {
  @IsNotEmpty({ message: 'El ID de la categoría es obligatorio' })
  @Type(() => Number)
  @IsNumber()
  categoryId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkCategoryTeamItemDto)
  teams: BulkCategoryTeamItemDto[];
}

export class SyncEditionTeamRegistrationsDto {
  @IsNotEmpty({ message: 'El ID de la edición del torneo es obligatorio' })
  @Type(() => Number)
  @IsNumber()
  categoryEditionId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkCategoryRegistrationGroupDto)
  categories: BulkCategoryRegistrationGroupDto[];
}
