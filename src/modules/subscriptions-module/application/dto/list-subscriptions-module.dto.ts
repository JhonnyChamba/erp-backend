import { IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ListSubscriptionsModuleDto {
  @Type(() => Number)
  @IsNumber()
  subscriptionId: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Min(1)
  page: number = 1;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Min(1)
  limit: number = 10;
}