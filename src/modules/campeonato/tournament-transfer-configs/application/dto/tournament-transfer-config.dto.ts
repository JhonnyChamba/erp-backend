import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class UpsertTournamentTransferConfigDto {
  @IsOptional()
  @IsBoolean()
  inscriptionsEnabled?: boolean;

  @IsOptional()
  @IsString()
  inscriptionsStartDate?: string;

  @IsOptional()
  @IsString()
  inscriptionsEndDate?: string;

  @IsOptional()
  @IsBoolean()
  inscriptionsRequireApproval?: boolean;

  @IsOptional()
  @IsBoolean()
  allowMassInscription?: boolean;

  @IsOptional()
  @IsBoolean()
  allowReinscription?: boolean;

  @IsOptional()
  @IsBoolean()
  transfersEnabled?: boolean;

  @IsOptional()
  @IsString()
  transfersStartDate?: string;

  @IsOptional()
  @IsString()
  transfersEndDate?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  maxTransfersPerPlayer?: number;

  @IsOptional()
  @IsBoolean()
  requireOriginTeamApproval?: boolean;

  @IsOptional()
  @IsBoolean()
  requireDestinationTeamApproval?: boolean;

  @IsOptional()
  @IsBoolean()
  requireAdminApproval?: boolean;
}
