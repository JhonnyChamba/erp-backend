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
import { PlayerTransfersService } from '../application/player-transfers.service';
import { CreatePlayerTransferDto } from '../application/dto/player-transfer.dto';

@UseGuards(AuthGuard('jwt'), CompanyAccessGuard)
@Controller('campeonato/player-transfers')
export class PlayerTransfersController {
  constructor(private readonly service: PlayerTransfersService) {}

  private resolveCompanyId(req: any): number {
    const headerVal = req?.headers?.['x-company-id'];
    const candidate = Number(headerVal) || Number(req?.companyId) || Number(req?.user?.company_id) || 1;
    return isNaN(candidate) || candidate <= 0 ? 1 : candidate;
  }

  @Get(':playerId')
  listByPlayer(@Param('playerId') playerId: string, @Req() req: any) {
    const companyId = this.resolveCompanyId(req);
    return this.service.listByPlayer(playerId, companyId);
  }

  @Post()
  create(@Body() dto: CreatePlayerTransferDto, @Req() req: any) {
    const companyId = this.resolveCompanyId(req);
    return this.service.create(dto, req.user, companyId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
