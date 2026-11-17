import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreatePlayerTransferDto {
  @IsNotEmpty({ message: 'El ID del jugador es obligatorio' })
  @IsUUID()
  playerId: string;

  @IsOptional()
  @IsUUID()
  originTeamId?: string;

  @IsNotEmpty({ message: 'El equipo de destino es obligatorio' })
  @IsUUID()
  destinationTeamId: string;

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
}
