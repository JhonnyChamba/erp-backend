import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { PaymentConcept, PaymentMethod, PaymentStatus } from '../../../common/enum/campeonato.enum';

export class CreatePaymentDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  teamRegistrationId?: number;

  @IsNotEmpty({ message: 'El concepto de pago es obligatorio' })
  @IsEnum(PaymentConcept)
  concept: PaymentConcept;

  @IsNotEmpty({ message: 'El monto es obligatorio' })
  @IsNumber()
  amount: number;

  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  receiptNumber?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdatePaymentDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  teamRegistrationId?: number;

  @IsOptional()
  @IsEnum(PaymentConcept)
  concept?: PaymentConcept;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  receiptNumber?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
