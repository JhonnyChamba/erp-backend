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
import { MatchEventsService } from '../application/match-events.service';
import { CreateMatchEventDto, UpdateMatchEventDto } from '../application/dto/match-event.dto';

@UseGuards(AuthGuard('jwt'), CompanyAccessGuard)
@Controller('campeonato/match-events')
export class MatchEventsController {
  constructor(private readonly service: MatchEventsService) {}

  private resolveCompanyId(req: any): number {
    const headerVal = req?.headers?.['x-company-id'];
    const candidate = Number(headerVal) || Number(req?.companyId) || Number(req?.user?.company_id) || 1;
    return !Number.isNaN(candidate) && candidate > 0 ? candidate : 1;
  }

  @Get()
  list(@Query() query: any, @Req() req: any) {
    return this.service.list(this.resolveCompanyId(req), query);
  }

  @Get(':id')
  get(@Param('id') id: string, @Req() req: any) {
    return this.service.get(id, this.resolveCompanyId(req));
  }

  @Post()
  create(@Body() dto: CreateMatchEventDto, @Req() req: any) {
    return this.service.create(dto, req.user, this.resolveCompanyId(req));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateMatchEventDto, @Req() req: any) {
    return this.service.update(id, dto, req.user, this.resolveCompanyId(req));
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.service.remove(id, this.resolveCompanyId(req));
  }
}
