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
  @IsUUID()
  editionId: string;

  @IsNotEmpty({ message: 'El ID del jugador es obligatorio' })
  @IsUUID()
  playerId: string;

  @IsNotEmpty({ message: 'El equipo de destino es obligatorio' })
  @IsUUID()
  destinationTeamId: string;

  @IsNotEmpty({ message: 'La inscripción del equipo de destino es obligatoria' })
  @IsUUID()
  destinationTeamRegistrationId: string;

  @IsOptional()
  @IsUUID()
  stageId?: string;

  @IsOptional()
  @IsUUID()
  targetClassificationId?: string;

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
  @IsUUID()
  passOwnerTeamId?: string;

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
  editionId?: string;

  @IsOptional()
  status?: TransferStatus;

  @IsOptional()
  originTeamId?: string;

  @IsOptional()
  destinationTeamId?: string;

  @IsOptional()
  playerId?: string;

  @IsOptional()
  search?: string;

  @IsOptional()
  page?: number;

  @IsOptional()
  limit?: number;
}
