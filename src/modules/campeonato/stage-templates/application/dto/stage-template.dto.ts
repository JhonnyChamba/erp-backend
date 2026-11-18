import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsArray, ValidateNested, IsInt, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class StageTemplateDetailItemDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsInt()
  stageOrder?: number;

  @IsNotEmpty({ message: 'El nombre de la etapa o fase es obligatorio' })
  @IsString()
  @MaxLength(150)
  name: string;

  @IsOptional()
  @IsString()
  competitionTypeId?: string;

  @IsOptional()
  @IsString()
  competitionLapId?: string;

  @IsOptional()
  @IsString()
  tieBreakerCriterionId?: string;
}

export class CreateStageTemplateDto {
  @IsNotEmpty({ message: 'El nombre de la plantilla es obligatorio' })
  @IsString()
  @MaxLength(150)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StageTemplateDetailItemDto)
  details?: StageTemplateDetailItemDto[];
}

export class UpdateStageTemplateDto extends CreateStageTemplateDto {}
