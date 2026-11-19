import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { TransferApprovalRole, TransferApprovalStatus, TransferStatus } from '../../../common/enum/campeonato.enum';

export class CreatePlayerTransferDto {
  @IsNotEmpty({ message: 'El ID de la edición de torneo es obligatorio' })
  @Type(() => Number)
  @IsNumber()
  editionId: number;

  @IsNotEmpty({ message: 'El ID del jugador es obligatorio' })
  @Type(() => Number)
  @IsNumber()
  playerId: number;

  @IsNotEmpty({ message: 'El equipo de destino es obligatorio' })
  @Type(() => Number)
  @IsNumber()
  destinationTeamId: number;

  @IsNotEmpty({ message: 'La inscripción del equipo de destino es obligatoria' })
  @IsUUID()
  destinationTeamRegistrationId: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  stageId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  targetClassificationId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  targetJerseyNumber?: number;

  @IsOptional()
  @IsString()
  seasonYear?: string;

  @IsOptional()
  @IsString()
  transferType?: string; // 'DEFINITIVA', 'PRESTAMO', 'LIBRE', 'RETORNO'

  @IsOptional()
  @IsString()
  passOwnerType?: string; // 'PLAYER' o 'TEAM'

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  passOwnerTeamId?: number;

  @IsOptional()
  @IsNumber()
  transferFee?: number;

  @IsOptional()
  transferDate?: Date | string;

  @IsOptional()
  @IsString()
  observations?: string;

  @IsOptional()
  @IsArray()
  documents?: any[];
}

export class ApproveTransferDto {
  @IsNotEmpty({ message: 'El rol de aprobación es obligatorio' })
  @IsEnum(TransferApprovalRole)
  role: TransferApprovalRole;

  @IsNotEmpty({ message: 'La decisión de aprobación es obligatoria' })
  @IsEnum(TransferApprovalStatus)
  status: TransferApprovalStatus;

  @IsOptional()
  @IsString()
  comments?: string;
}

export class FilterTransferQueryDto {
  @IsOptional()
  editionId?: number;

  @IsOptional()
  status?: TransferStatus;

  @IsOptional()
  originTeamId?: number;

  @IsOptional()
  destinationTeamId?: number;

  @IsOptional()
  playerId?: number;

  @IsOptional()
  search?: string;

  @IsOptional()
  page?: number;

  @IsOptional()
  limit?: number;
}
