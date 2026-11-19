import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateTeamCategoryHistoryDto {
  @IsNotEmpty({ message: 'El ID del equipo es obligatorio' })
  @Type(() => Number)
  @IsNumber()
  teamId: number;

  @IsNotEmpty({ message: 'El ID de la categoría es obligatorio' })
  @Type(() => Number)
  @IsNumber()
  categoryId: number;

  @IsOptional()
  @IsString()
  seasonYear?: string;

  @IsOptional()
  @IsString()
  status?: string; // 'ACTUAL', 'ASCENSO', 'DESCENSO', 'REGULAR'

  @IsOptional()
  assignedDate?: Date | string;

  @IsOptional()
  @IsString()
  notes?: string;
}
