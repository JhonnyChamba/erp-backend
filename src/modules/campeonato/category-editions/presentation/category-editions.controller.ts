import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CompanyAccessGuard } from 'src/auth/guards/company-access.guard';
import { CategoryEditionsService } from '../application/category-editions.service';
import { CreateCategoryEditionDto, UpdateCategoryEditionDto } from '../application/dto/category-edition.dto';

@UseGuards(AuthGuard('jwt'), CompanyAccessGuard)
@Controller('campeonato/category-editions')
export class CategoryEditionsController {
  constructor(private readonly service: CategoryEditionsService) {}

  private resolveCompanyId(req: any): number {
    const headerVal = req?.headers?.['x-company-id'];
    const candidate = Number(headerVal) || Number(req?.companyId) || Number(req?.user?.company_id) || 1;
    return !Number.isNaN(candidate) && candidate > 0 ? candidate : 1;
  }

  @Get()
  list(@Query() query: any, @Req() req: any) {
    return this.service.list(this.resolveCompanyId(req), query);
  }

  // Qué se eliminaría junto con la edición (para confirmarlo antes de borrar)
  @Get(':id/deletion-summary')
  deletionSummary(@Param('id') id: string, @Req() req: any) {
    return this.service.deletionSummary(id, this.resolveCompanyId(req));
  }

  @Get(':id')
  get(@Param('id') id: string, @Req() req: any) {
    return this.service.getForm(id, this.resolveCompanyId(req));
  }

  @Post()
  create(@Body() dto: CreateCategoryEditionDto, @Req() req: any) {
    return this.service.create(dto, req.user, this.resolveCompanyId(req));
  }

  // Inicia el campeonato de una categoría de la edición (una sola vez por categoría): su primera etapa pasa a EN PROCESO
  @Post(':id/categories/:categoryId/start')
  start(@Param('id') id: string, @Param('categoryId') categoryId: string, @Req() req: any) {
    return this.service.start(id, categoryId, req.user, this.resolveCompanyId(req));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCategoryEditionDto, @Req() req: any) {
    return this.service.update(id, dto, req.user, this.resolveCompanyId(req));
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.service.remove(id, this.resolveCompanyId(req));
  }
}
