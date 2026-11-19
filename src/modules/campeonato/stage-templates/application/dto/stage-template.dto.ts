import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class StageTemplateDetailItemDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  id?: number;

  @IsOptional()
  @IsInt()
  stageOrder?: number;

  @IsNotEmpty({ message: 'El nombre de la etapa o fase es obligatorio' })
  @IsString()
  @MaxLength(150)
  name: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  competitionTypeId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  competitionLapId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  tieBreakerCriterionId?: number;
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
