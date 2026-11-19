import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
  Delete,
  Param,
  Body,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CompanyAccessGuard } from 'src/auth/guards/company-access.guard';
import { StagesService } from '../application/stages.service';
import {
  CreateStageDto,
  UpdateStageDto,
  CreateStagePlayerClassificationDto,
  UpdateStagePlayerClassificationDto,
} from '../application/dto/stage.dto';

@UseGuards(AuthGuard('jwt'), CompanyAccessGuard)
@Controller('campeonato/stages')
export class StagesController {
  constructor(private readonly service: StagesService) {}

  private resolveCompanyId(req: any): number {
    const headerVal = req?.headers?.['x-company-id'];
    const candidate = Number(headerVal) || Number(req?.companyId) || Number(req?.user?.company_id) || 1;
    return !Number.isNaN(candidate) && candidate > 0 ? candidate : 1;
  }

  @Get()
  list(@Query() query: any, @Req() req: any) {
    return this.service.list(this.resolveCompanyId(req), query);
  }

  @Get(':id')
  get(@Param('id') id: string, @Req() req: any) {
    return this.service.get(id, this.resolveCompanyId(req));
  }

  @Post()
  create(@Body() dto: CreateStageDto, @Req() req: any) {
    return this.service.create(dto, req.user, this.resolveCompanyId(req));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateStageDto, @Req() req: any) {
    return this.service.update(id, dto, req.user, this.resolveCompanyId(req));
  }

  @Put(':id')
  updatePut(@Param('id') id: string, @Body() dto: UpdateStageDto, @Req() req: any) {
    return this.service.update(id, dto, req.user, this.resolveCompanyId(req));
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.service.remove(id, this.resolveCompanyId(req));
  }

  // Endpoints para clasificaciones por etapa
  @Get(':id/classifications')
  listClassifications(@Param('id') id: string, @Req() req: any) {
    return this.service.listClassifications(id, this.resolveCompanyId(req));
  }

  @Post(':id/classifications')
  addClassification(
    @Param('id') id: string,
    @Body() dto: CreateStagePlayerClassificationDto,
    @Req() req: any,
  ) {
    return this.service.addClassification(id, dto, req.user, this.resolveCompanyId(req));
  }

  @Put('classifications/:classificationId')
  updateClassification(
    @Param('classificationId') classificationId: string,
    @Body() dto: UpdateStagePlayerClassificationDto,
    @Req() req: any,
  ) {
    return this.service.updateClassification(classificationId, dto, req.user, this.resolveCompanyId(req));
  }

  @Delete('classifications/:classificationId')
  removeClassification(@Param('classificationId') classificationId: string, @Req() req: any) {
    return this.service.removeClassification(classificationId, this.resolveCompanyId(req));
  }
}
