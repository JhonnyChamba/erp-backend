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
import { TeamRegistrationsService } from '../application/team-registrations.service';
import {
  CreateTeamRegistrationDto,
  UpdateTeamRegistrationDto,
  SyncEditionTeamRegistrationsDto,
} from '../application/dto/team-registration.dto';

@UseGuards(AuthGuard('jwt'), CompanyAccessGuard)
@Controller('campeonato/team-registrations')
export class TeamRegistrationsController {
  constructor(private readonly service: TeamRegistrationsService) {}

  private resolveCompanyId(req: any): number {
    const headerVal = req?.headers?.['x-company-id'];
    const candidate = Number(headerVal) || Number(req?.companyId) || Number(req?.user?.company_id) || 1;
    return !Number.isNaN(candidate) && candidate > 0 ? candidate : 1;
  }

  @Get()
  list(@Query() query: any, @Req() req: any) {
    return this.service.list(this.resolveCompanyId(req), query);
  }

  // Debe declararse antes de ':id' para que 'grouped' no se interprete como un id.
  @Get('grouped')
  listByEdition(@Query() query: any, @Req() req: any) {
    return this.service.listByEdition(this.resolveCompanyId(req), query);
  }

  @Get(':id')
  get(@Param('id') id: string, @Req() req: any) {
    return this.service.get(id, this.resolveCompanyId(req));
  }

  @Post('sync-edition')
  syncByEdition(@Body() dto: SyncEditionTeamRegistrationsDto, @Req() req: any) {
    return this.service.syncByEdition(dto, req.user, this.resolveCompanyId(req));
  }

  @Post()
  create(@Body() dto: CreateTeamRegistrationDto, @Req() req: any) {
    return this.service.create(dto, req.user, this.resolveCompanyId(req));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTeamRegistrationDto, @Req() req: any) {
    return this.service.update(id, dto, req.user, this.resolveCompanyId(req));
  }

  @Delete(':id')
  // `forcePlayers=true`: confirma que también se eliminen los jugadores inscritos de ese equipo
  remove(@Param('id') id: string, @Query('forcePlayers') forcePlayers: string, @Req() req: any) {
    return this.service.remove(id, this.resolveCompanyId(req), forcePlayers === 'true');
  }
}
