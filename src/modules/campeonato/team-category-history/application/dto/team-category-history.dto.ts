import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateTeamCategoryHistoryDto {
  @IsNotEmpty({ message: 'El ID del equipo es obligatorio' })
  @IsUUID()
  teamId: string;

  @IsNotEmpty({ message: 'El ID de la categoría es obligatorio' })
  @IsUUID()
  categoryId: string;

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
