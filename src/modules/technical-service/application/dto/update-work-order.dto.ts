import {
  IsOptional,
  IsString,
  IsNumber,
  IsArray,
  ValidateNested,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { WorkOrderItemDto } from './create-work-order.dto';

export class UpdateWorkOrderDto {
  @IsOptional()
  @IsNumber()
  companyId?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  branchId?: number | null;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  customerId?: number;

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

  @IsOptional()
  @IsString()
  serviceType?: string;

  @IsOptional()
  @IsString()
  priority?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  equipmentType?: string;

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

  @IsOptional()
  @IsString()
  reportedFailure?: string;

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
  @IsDateString()
  realDeliveryDate?: string | null;

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
