import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CompanyAccessGuard } from 'src/auth/guards/company-access.guard';
import { PlayerTransfersService } from '../application/player-transfers.service';
import {
  CreatePlayerTransferDto,
  ApproveTransferDto,
  FilterTransferQueryDto,
} from '../application/dto/player-transfer.dto';

@UseGuards(AuthGuard('jwt'), CompanyAccessGuard)
@Controller('campeonato/player-transfers')
export class PlayerTransfersController {
  constructor(private readonly service: PlayerTransfersService) {}

  private resolveCompanyId(req: any): number {
    const headerVal = req?.headers?.['x-company-id'];
    const candidate = Number(headerVal) || Number(req?.companyId) || Number(req?.user?.company_id) || 1;
    return isNaN(candidate) || candidate <= 0 ? 1 : candidate;
  }

  @Get()
  list(@Query() query: FilterTransferQueryDto, @Req() req: any) {
    const companyId = this.resolveCompanyId(req);
    return this.service.list(companyId, query);
  }

  @Get('sports-history/:playerId')
  getSportsHistory(@Param('playerId') playerId: string, @Req() req: any) {
    return this.service.getSportsHistory(playerId, this.resolveCompanyId(req));
  }

  @Get('player/:playerId')
  listByPlayer(@Param('playerId') playerId: string, @Req() req: any) {
    const companyId = this.resolveCompanyId(req);
    return this.service.listByPlayer(playerId, companyId);
  }

  @Get(':id')
  get(@Param('id') id: string, @Req() req: any) {
    return this.service.get(id, this.resolveCompanyId(req));
  }

  @Post()
  create(@Body() dto: CreatePlayerTransferDto, @Req() req: any) {
    const companyId = this.resolveCompanyId(req);
    return this.service.createRequest(dto, req.user, companyId);
  }

  @Post(':id/approve')
  approve(
    @Param('id') id: string,
    @Body() dto: ApproveTransferDto,
    @Req() req: any,
  ) {
    return this.service.approve(id, dto, req.user, this.resolveCompanyId(req));
  }

  @Post(':id/execute')
  execute(@Param('id') id: string, @Req() req: any) {
    return this.service.execute(id, req.user, this.resolveCompanyId(req));
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.service.remove(id, this.resolveCompanyId(req));
  }
}
