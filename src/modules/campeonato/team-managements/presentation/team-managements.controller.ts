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
import { TeamManagementsService } from '../application/team-managements.service';
import { CreateTeamManagementDto, UpdateTeamManagementDto } from '../application/dto/team-management.dto';

@UseGuards(AuthGuard('jwt'), CompanyAccessGuard)
@Controller('campeonato/team-managements')
export class TeamManagementsController {
  constructor(private readonly service: TeamManagementsService) {}

  private resolveCompanyId(req: any): number {
    const headerVal = req?.headers?.['x-company-id'];
    const candidate = Number(headerVal) || Number(req?.companyId) || Number(req?.user?.company_id) || 1;
    return !Number.isNaN(candidate) && candidate > 0 ? candidate : 1;
  }

  @Get()
  list(@Query() query: any, @Req() req: any) {
    return this.service.list(this.resolveCompanyId(req), query);
  }

  @Get('by-team/:teamId')
  listByTeam(@Param('teamId') teamId: string, @Req() req: any) {
    return this.service.listByTeam(teamId, this.resolveCompanyId(req));
  }

  @Get(':id')
  get(@Param('id') id: string, @Req() req: any) {
    return this.service.get(id, this.resolveCompanyId(req));
  }

  @Post()
  create(@Body() dto: CreateTeamManagementDto, @Req() req: any) {
    return this.service.create(dto, req.user, this.resolveCompanyId(req));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTeamManagementDto, @Req() req: any) {
    return this.service.update(id, dto, req.user, this.resolveCompanyId(req));
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.service.remove(id, this.resolveCompanyId(req));
  }
}
