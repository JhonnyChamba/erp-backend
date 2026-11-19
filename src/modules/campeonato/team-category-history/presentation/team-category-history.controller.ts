import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CompanyAccessGuard } from 'src/auth/guards/company-access.guard';
import { TeamCategoryHistoryService } from '../application/team-category-history.service';
import { CreateTeamCategoryHistoryDto } from '../application/dto/team-category-history.dto';

@UseGuards(AuthGuard('jwt'), CompanyAccessGuard)
@Controller('campeonato/team-category-history')
export class TeamCategoryHistoryController {
  constructor(private readonly service: TeamCategoryHistoryService) {}

  private resolveCompanyId(req: any): number {
    const headerVal = req?.headers?.['x-company-id'];
    const candidate = Number(headerVal) || Number(req?.companyId) || Number(req?.user?.company_id) || 1;
    return isNaN(candidate) || candidate <= 0 ? 1 : candidate;
  }

  @Get(':teamId')
  listByTeam(@Param('teamId') teamId: string, @Req() req: any) {
    const companyId = this.resolveCompanyId(req);
    return this.service.listByTeam(teamId, companyId);
  }

  @Post()
  create(@Body() dto: CreateTeamCategoryHistoryDto, @Req() req: any) {
    const companyId = this.resolveCompanyId(req);
    return this.service.create(dto, req.user, companyId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.service.remove(id, this.resolveCompanyId(req));
  }
}
