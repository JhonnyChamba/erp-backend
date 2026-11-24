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
import { PlayerRegistrationsService } from '../application/player-registrations.service';
import {
  CreatePlayerRegistrationDto,
  UpdatePlayerRegistrationDto,
  MassPlayerRegistrationDto,
  UpdatePlayerRegistrationStatusDto,
  SyncTeamEditionRosterDto,
} from '../application/dto/player-registration.dto';

@UseGuards(AuthGuard('jwt'), CompanyAccessGuard)
@Controller('campeonato/player-registrations')
export class PlayerRegistrationsController {
  constructor(private readonly service: PlayerRegistrationsService) {}

  private resolveCompanyId(req: any): number {
    const headerVal = req?.headers?.['x-company-id'];
    const candidate = Number(headerVal) || Number(req?.companyId) || Number(req?.user?.company_id) || 1;
    return !Number.isNaN(candidate) && candidate > 0 ? candidate : 1;
  }

  @Get()
  list(@Query() query: any, @Req() req: any) {
    return this.service.list(this.resolveCompanyId(req), query);
  }

  @Get('grouped')
  listGrouped(@Query() query: any, @Req() req: any) {
    return this.service.listByTeamAndEdition(this.resolveCompanyId(req), query);
  }

  @Post('sync-team-roster')
  syncTeamRoster(@Body() dto: SyncTeamEditionRosterDto, @Req() req: any) {
    return this.service.syncTeamEditionRoster(dto, req.user, this.resolveCompanyId(req));
  }

  @Get('roster/:teamRegistrationId')
  getRoster(@Param('teamRegistrationId') teamRegistrationId: string, @Req() req: any) {
    return this.service.getRosterByTeamRegistration(teamRegistrationId, this.resolveCompanyId(req));
  }

  @Get(':id')
  get(@Param('id') id: string, @Req() req: any) {
    return this.service.get(id, this.resolveCompanyId(req));
  }

  @Post()
  create(@Body() dto: CreatePlayerRegistrationDto, @Req() req: any) {
    return this.service.create(dto, req.user, this.resolveCompanyId(req));
  }

  @Post('mass')
  createMass(@Body() dto: MassPlayerRegistrationDto, @Req() req: any) {
    return this.service.createMass(dto, req.user, this.resolveCompanyId(req));
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdatePlayerRegistrationStatusDto,
    @Req() req: any,
  ) {
    return this.service.updateStatus(id, dto, req.user, this.resolveCompanyId(req));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePlayerRegistrationDto, @Req() req: any) {
    return this.service.update(id, dto, req.user, this.resolveCompanyId(req));
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.service.remove(id, this.resolveCompanyId(req));
  }
}
