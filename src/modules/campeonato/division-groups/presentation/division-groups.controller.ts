import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CompanyAccessGuard } from 'src/auth/guards/company-access.guard';
import { SuperAdminGuard } from 'src/auth/guards/super-admin.guard';
import { DivisionGroupsService } from '../application/division-groups.service';
import {
  CreateDivisionGroupDto,
  ListDivisionGroupDto,
  UpdateDivisionGroupDto,
} from '../application/dto/division-group.dto';

@UseGuards(AuthGuard('jwt'), CompanyAccessGuard)
@Controller('campeonato/division-groups')
export class DivisionGroupsController {
  constructor(private readonly service: DivisionGroupsService) {}

  private resolveCompanyId(req: any): number {
    const headerVal = req?.headers?.['x-company-id'];
    const candidate = Number(headerVal) || Number(req?.companyId) || Number(req?.user?.company_id) || 1;
    return !Number.isNaN(candidate) && candidate > 0 ? candidate : 1;
  }

  @Get()
  list(@Query() query: ListDivisionGroupDto, @Req() req: any) {
    return this.service.list(this.resolveCompanyId(req), query);
  }

  @Get(':id')
  get(@Param('id') id: string, @Req() req: any) {
    return this.service.get(id, this.resolveCompanyId(req));
  }

  @Post()
  @UseGuards(SuperAdminGuard)
  create(@Body() dto: CreateDivisionGroupDto, @Req() req: any) {
    return this.service.create(dto, req.user, this.resolveCompanyId(req));
  }

  @Patch(':id')
  @UseGuards(SuperAdminGuard)
  update(@Param('id') id: string, @Body() dto: UpdateDivisionGroupDto, @Req() req: any) {
    return this.service.update(id, dto, req.user, this.resolveCompanyId(req));
  }

  @Delete(':id')
  @UseGuards(SuperAdminGuard)
  remove(@Param('id') id: string, @Req() req: any) {
    return this.service.remove(id, this.resolveCompanyId(req), req.user);
  }
}
