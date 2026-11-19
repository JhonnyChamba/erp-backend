import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SuperAdminGuard } from 'src/auth/guards/super-admin.guard';
import { CompanyAccessGuard } from 'src/auth/guards/company-access.guard';
import { TieBreakerCriteriaService } from '../application/tie-breaker-criteria.service';
import { CreateTieBreakerCriterionDto, UpdateTieBreakerCriterionDto } from '../application/dto/tie-breaker-criterion.dto';

@UseGuards(AuthGuard('jwt'), CompanyAccessGuard)
@Controller('campeonato/tie-breaker-criteria')
export class TieBreakerCriteriaController {
  constructor(private readonly service: TieBreakerCriteriaService) {}

  private resolveCompanyId(req: any): number {
    const headerVal = req?.headers?.['x-company-id'];
    const candidate = Number(headerVal) || Number(req?.companyId) || Number(req?.user?.company_id) || 1;
    return !Number.isNaN(candidate) && candidate > 0 ? candidate : 1;
  }

  @Get()
  list(@Req() req: any, @Query() query: any) {
    return this.service.list(this.resolveCompanyId(req), query);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.service.get(id);
  }

  @Post()
  @UseGuards(SuperAdminGuard)
  create(@Body() dto: CreateTieBreakerCriterionDto, @Req() req: any) {
    return this.service.create(dto, req.user, this.resolveCompanyId(req));
  }

  @Put(':id')
  @UseGuards(SuperAdminGuard)
  update(@Param('id') id: string, @Body() dto: UpdateTieBreakerCriterionDto, @Req() req: any) {
    return this.service.update(id, dto, req.user);
  }

  @Patch(':id')
  @UseGuards(SuperAdminGuard)
  updatePatch(@Param('id') id: string, @Body() dto: UpdateTieBreakerCriterionDto, @Req() req: any) {
    return this.service.update(id, dto, req.user);
  }

  @Delete(':id')
  @UseGuards(SuperAdminGuard)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
