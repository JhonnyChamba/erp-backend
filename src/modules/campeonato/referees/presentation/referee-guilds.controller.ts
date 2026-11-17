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
import { RefereeGuildsService } from '../application/referee-guilds.service';
import { CreateRefereeGuildDto, UpdateRefereeGuildDto } from '../application/dto/referee-guild.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('campeonato/referee-guilds')
export class RefereeGuildsController {
  constructor(private readonly service: RefereeGuildsService) {}

  @Get()
  list(@Query() query: any) {
    return this.service.list(query);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.service.get(id);
  }

  @Post()
  create(@Body() dto: CreateRefereeGuildDto, @Req() req: any) {
    return this.service.create(dto, req.user);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateRefereeGuildDto, @Req() req: any) {
    return this.service.update(id, dto, req.user);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
