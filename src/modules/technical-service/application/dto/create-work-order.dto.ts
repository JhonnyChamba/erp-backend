import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsArray,
  ValidateNested,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class WorkOrderItemDto {
  @IsOptional()
  @IsNumber()
  id?: number;

  @IsString()
  @IsNotEmpty()
  itemType: 'SERVICIO' | 'REPUESTO';

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @Type(() => Number)
  quantity: number;

  @IsNumber()
  @Type(() => Number)
  unitPrice: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  subtotal?: number;
}

export class CreateWorkOrderDto {
  @IsOptional()
  @IsNumber()
  companyId?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  branchId?: number | null;

  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty()
  customerId: number;

  @IsOptional()
  @IsString()
  customerName?: string;

  @IsOptional()
  @IsString()
  customerPhone?: string;

  @IsOptional()
  @IsString()
  customerEmail?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  technicianId?: number | null;

  @IsOptional()
  @IsString()
  technicianName?: string | null;

  @IsOptional()
  @IsString()
  orderNumber?: string;

  @IsString()
  @IsNotEmpty()
  serviceType: string; // REPARACION, MANTENIMIENTO_PREVENTIVO, MANTENIMIENTO_CORRECTIVO, DIAGNOSTICO, GARANTIA

  @IsString()
  @IsNotEmpty()
  priority: string; // BAJA, MEDIA, ALTA, URGENTE

  @IsOptional()
  @IsString()
  status?: string;

  @IsString()
  @IsNotEmpty()
  equipmentType: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsString()
  serialNumber?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  securityPin?: string;

  @IsOptional()
  @IsString()
  accessories?: string;

  @IsOptional()
  @IsString()
  physicalCondition?: string;

  @IsString()
  @IsNotEmpty()
  reportedFailure: string;

  @IsOptional()
  @IsString()
  technicalDiagnosis?: string;

  @IsOptional()
  @IsString()
  solutionApplied?: string;

  @IsOptional()
  @IsDateString()
  entryDate?: string;

  @IsOptional()
  @IsDateString()
  estimatedDeliveryDate?: string | null;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  warrantyDays?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  laborCost?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  partsCost?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  subtotal?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  taxAmount?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  totalAmount?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  advancePayment?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  pendingBalance?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkOrderItemDto)
  items?: WorkOrderItemDto[];
}
