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
import { PlayersService } from '../application/players.service';
import { CreatePlayerDto, UpdatePlayerDto } from '../application/dto/player.dto';

@UseGuards(AuthGuard('jwt'), CompanyAccessGuard)
@Controller('campeonato/players')
export class PlayersController {
  constructor(private readonly service: PlayersService) {}

  private resolveCompanyId(req: any): number {
    const headerVal = req?.headers?.['x-company-id'];
    const candidate = Number(headerVal) || Number(req?.companyId) || Number(req?.user?.company_id) || 1;
    return !Number.isNaN(candidate) && candidate > 0 ? candidate : 1;
  }

  @Get()
  list(@Query() query: any, @Req() req: any) {
    return this.service.list(this.resolveCompanyId(req), query);
  }

  @Get('find-global/:identification')
  findGlobal(@Param('identification') identification: string, @Req() req: any) {
    return this.service.findGlobalByIdentification(identification, this.resolveCompanyId(req));
  }

  @Get('consulta-registro-civil/:identification')
  consultaRegistroCivil(@Param('identification') identification: string, @Req() req: any) {
    return this.service.consultaRegistroCivil(identification, this.resolveCompanyId(req));
  }

  @Get(':id')
  get(@Param('id') id: string, @Req() req: any) {
    return this.service.get(id, this.resolveCompanyId(req), req.user);
  }

  @Post()
  create(@Body() dto: CreatePlayerDto, @Req() req: any) {
    return this.service.create(dto, req.user, this.resolveCompanyId(req));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePlayerDto, @Req() req: any) {
    return this.service.update(id, dto, req.user, this.resolveCompanyId(req));
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Query('global') global: string, @Req() req: any) {
    return this.service.remove(id, this.resolveCompanyId(req), req.user, global === 'true');
  }
}
