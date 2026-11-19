import { Controller, Get, Put, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CompanyAccessGuard } from 'src/auth/guards/company-access.guard';
import { TournamentTransferConfigsService } from '../application/tournament-transfer-configs.service';
import { UpsertTournamentTransferConfigDto } from '../application/dto/tournament-transfer-config.dto';

@Controller('campeonato/tournament-transfer-configs')
@UseGuards(AuthGuard('jwt'), CompanyAccessGuard)
export class TournamentTransferConfigsController {
  constructor(private readonly service: TournamentTransferConfigsService) {}

  private resolveCompanyId(req: any): number {
    const headerVal = req?.headers?.['x-company-id'];
    const candidate = Number(headerVal) || Number(req?.companyId) || Number(req?.user?.company_id) || 1;
    return !Number.isNaN(candidate) && candidate > 0 ? candidate : 1;
  }

  @Get(':editionId')
  getByEdition(@Param('editionId') editionId: string, @Request() req: any) {
    return this.service.getByEdition(editionId, this.resolveCompanyId(req));
  }

  @Put(':editionId')
  upsert(
    @Param('editionId') editionId: string,
    @Body() dto: UpsertTournamentTransferConfigDto,
    @Request() req: any,
  ) {
    return this.service.upsert(editionId, dto, this.resolveCompanyId(req));
  }
}
