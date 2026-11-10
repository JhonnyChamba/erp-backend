import { IsBoolean, IsNumber, IsOptional, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class ListBranchCompanyDto {
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  companyId?: number;

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

  // true: solo sucursales habilitadas (selección de sucursal, facturación)
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  onlyEnabled?: boolean;
}
