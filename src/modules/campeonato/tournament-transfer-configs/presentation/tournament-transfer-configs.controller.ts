import { Controller, Get, Put, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TournamentTransferConfigsService } from '../application/tournament-transfer-configs.service';
import { UpsertTournamentTransferConfigDto } from '../application/dto/tournament-transfer-config.dto';

@Controller('campeonato/tournament-transfer-configs')
@UseGuards(AuthGuard('jwt'))
export class TournamentTransferConfigsController {
  constructor(private readonly service: TournamentTransferConfigsService) {}

  @Get(':editionId')
  getByEdition(@Param('editionId') editionId: string, @Request() req: any) {
    const companyId = req.user?.companyId || req.user?.company_id;
    return this.service.getByEdition(editionId, companyId);
  }

  @Put(':editionId')
  upsert(
    @Param('editionId') editionId: string,
    @Body() dto: UpsertTournamentTransferConfigDto,
    @Request() req: any,
  ) {
    const companyId = req.user?.companyId || req.user?.company_id;
    return this.service.upsert(editionId, dto, companyId);
  }
}
