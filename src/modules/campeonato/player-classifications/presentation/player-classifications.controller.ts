import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CompanyAccessGuard } from 'src/auth/guards/company-access.guard';
import { PlayerClassificationsService } from '../application/player-classifications.service';
import { CreatePlayerClassificationDto, UpdatePlayerClassificationDto } from '../application/dto/player-classification.dto';

@UseGuards(AuthGuard('jwt'), CompanyAccessGuard)
@Controller('campeonato/player-classifications')
export class PlayerClassificationsController {
  constructor(private readonly service: PlayerClassificationsService) {}

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
  create(@Body() dto: CreatePlayerClassificationDto, @Req() req: any) {
    return this.service.create(dto, req.user, this.resolveCompanyId(req));
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePlayerClassificationDto, @Req() req: any) {
    return this.service.update(id, dto, req.user);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
