import { IsNotEmpty, IsOptional, IsString, IsDateString } from 'class-validator';

export class UpdateWorkOrderStatusDto {
  @IsString()
  @IsNotEmpty()
  status: string;

  @IsOptional()
  @IsString()
  technicalDiagnosis?: string;

  @IsOptional()
  @IsString()
  solutionApplied?: string;

  @IsOptional()
  @IsDateString()
  realDeliveryDate?: string;

  // Nota del cambio de estado: se agrega a las observaciones (notes) de la orden.
  @IsOptional()
  @IsString()
  notes?: string;
}
