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
import { CampeonatoService } from '../application/campeonato.service';

@UseGuards(AuthGuard('jwt'), CompanyAccessGuard)
@Controller('campeonato')
export class CampeonatoController {
  constructor(private readonly campeonatoService: CampeonatoService) {}

  private resolveCompanyId(req: any): number {
    const headerVal = req?.headers?.['x-company-id'];
    const candidate = Number(headerVal) || Number(req?.companyId) || Number(req?.user?.company_id) || 1;
    return !Number.isNaN(candidate) && candidate > 0 ? candidate : 1;
  }

  // 1. POSITIONS
  @Get('positions')
  listPositions(@Query() query: any, @Req() req: any) {
    return this.campeonatoService.listPositions(this.resolveCompanyId(req), query);
  }
  @Get('positions/:id')
  getPosition(@Param('id') id: string) {
    return this.campeonatoService.getPosition(id);
  }
  @Post('positions')
  createPosition(@Body() dto: any, @Req() req: any) {
    return this.campeonatoService.createPosition(dto, req.user, this.resolveCompanyId(req));
  }
  @Patch('positions/:id')
  updatePosition(@Param('id') id: string, @Body() dto: any, @Req() req: any) {
    return this.campeonatoService.updatePosition(id, dto, req.user);
  }
  @Delete('positions/:id')
  removePosition(@Param('id') id: string) {
    return this.campeonatoService.removePosition(id);
  }

  // 2. DEMARCATIONS
  @Get('demarcations')
  listDemarcations(@Query() query: any, @Req() req: any) {
    return this.campeonatoService.listDemarcations(this.resolveCompanyId(req), query);
  }
  @Get('demarcations/:id')
  getDemarcation(@Param('id') id: string) {
    return this.campeonatoService.getDemarcation(id);
  }
  @Post('demarcations')
  createDemarcation(@Body() dto: any, @Req() req: any) {
    return this.campeonatoService.createDemarcation(dto, req.user, this.resolveCompanyId(req));
  }
  @Patch('demarcations/:id')
  updateDemarcation(@Param('id') id: string, @Body() dto: any, @Req() req: any) {
    return this.campeonatoService.updateDemarcation(id, dto, req.user);
  }
  @Delete('demarcations/:id')
  removeDemarcation(@Param('id') id: string) {
    return this.campeonatoService.removeDemarcation(id);
  }

  // 3. TEAMS
  @Get('teams')
  listTeams(@Query() query: any, @Req() req: any) {
    return this.campeonatoService.listTeams(this.resolveCompanyId(req), query);
  }
  @Get('teams/:id')
  getTeam(@Param('id') id: string) {
    return this.campeonatoService.getTeam(id);
  }
  @Post('teams')
  createTeam(@Body() dto: any, @Req() req: any) {
    return this.campeonatoService.createTeam(dto, req.user, this.resolveCompanyId(req));
  }
  @Patch('teams/:id')
  updateTeam(@Param('id') id: string, @Body() dto: any, @Req() req: any) {
    return this.campeonatoService.updateTeam(id, dto, req.user);
  }
  @Delete('teams/:id')
  removeTeam(@Param('id') id: string) {
    return this.campeonatoService.removeTeam(id);
  }

  // 4. PLAYERS
  @Get('players')
  listPlayers(@Query() query: any, @Req() req: any) {
    return this.campeonatoService.listPlayers(this.resolveCompanyId(req), query);
  }
  @Get('players/:id')
  getPlayer(@Param('id') id: string) {
    return this.campeonatoService.getPlayer(id);
  }
  @Post('players')
  createPlayer(@Body() dto: any, @Req() req: any) {
    return this.campeonatoService.createPlayer(dto, req.user, this.resolveCompanyId(req));
  }
  @Patch('players/:id')
  updatePlayer(@Param('id') id: string, @Body() dto: any, @Req() req: any) {
    return this.campeonatoService.updatePlayer(id, dto, req.user);
  }
  @Delete('players/:id')
  removePlayer(@Param('id') id: string) {
    return this.campeonatoService.removePlayer(id);
  }

  // 5. COMMITTEES
  @Get('committees')
  listCommittees(@Query() query: any, @Req() req: any) {
    return this.campeonatoService.listCommittees(this.resolveCompanyId(req), query);
  }
  @Get('committees/:id')
  getCommittee(@Param('id') id: string) {
    return this.campeonatoService.getCommittee(id);
  }
  @Post('committees')
  createCommittee(@Body() dto: any, @Req() req: any) {
    return this.campeonatoService.createCommittee(dto, req.user, this.resolveCompanyId(req));
  }
  @Patch('committees/:id')
  updateCommittee(@Param('id') id: string, @Body() dto: any, @Req() req: any) {
    return this.campeonatoService.updateCommittee(id, dto, req.user);
  }
  @Delete('committees/:id')
  removeCommittee(@Param('id') id: string) {
    return this.campeonatoService.removeCommittee(id);
  }

  // 6. TEAM MANAGEMENTS
  @Get('team-managements')
  listTeamManagements(@Query() query: any, @Req() req: any) {
    return this.campeonatoService.listTeamManagements(this.resolveCompanyId(req), query);
  }
  @Get('team-managements/:id')
  getTeamManagement(@Param('id') id: string) {
    return this.campeonatoService.getTeamManagement(id);
  }
  @Post('team-managements')
  createTeamManagement(@Body() dto: any, @Req() req: any) {
    return this.campeonatoService.createTeamManagement(dto, req.user, this.resolveCompanyId(req));
  }
  @Patch('team-managements/:id')
  updateTeamManagement(@Param('id') id: string, @Body() dto: any, @Req() req: any) {
    return this.campeonatoService.updateTeamManagement(id, dto, req.user);
  }
  @Delete('team-managements/:id')
  removeTeamManagement(@Param('id') id: string) {
    return this.campeonatoService.removeTeamManagement(id);
  }

  // 7. CATEGORIES
  @Get('categories')
  listCategories(@Query() query: any, @Req() req: any) {
    return this.campeonatoService.listCategories(this.resolveCompanyId(req), query);
  }
  @Get('categories/:id')
  getCategory(@Param('id') id: string) {
    return this.campeonatoService.getCategory(id);
  }
  @Post('categories')
  createCategory(@Body() dto: any, @Req() req: any) {
    return this.campeonatoService.createCategory(dto, req.user, this.resolveCompanyId(req));
  }
  @Patch('categories/:id')
  updateCategory(@Param('id') id: string, @Body() dto: any, @Req() req: any) {
    return this.campeonatoService.updateCategory(id, dto, req.user);
  }
  @Delete('categories/:id')
  removeCategory(@Param('id') id: string) {
    return this.campeonatoService.removeCategory(id);
  }

  // 8. CATEGORY EDITIONS
  @Get('category-editions')
  listCategoryEditions(@Query() query: any, @Req() req: any) {
    return this.campeonatoService.listCategoryEditions(this.resolveCompanyId(req), query);
  }
  @Get('category-editions/:id')
  getCategoryEdition(@Param('id') id: string) {
    return this.campeonatoService.getCategoryEdition(id);
  }
  @Post('category-editions')
  createCategoryEdition(@Body() dto: any, @Req() req: any) {
    return this.campeonatoService.createCategoryEdition(dto, req.user, this.resolveCompanyId(req));
  }
  @Patch('category-editions/:id')
  updateCategoryEdition(@Param('id') id: string, @Body() dto: any, @Req() req: any) {
    return this.campeonatoService.updateCategoryEdition(id, dto, req.user);
  }
  @Delete('category-editions/:id')
  removeCategoryEdition(@Param('id') id: string) {
    return this.campeonatoService.removeCategoryEdition(id);
  }

  // 9. STAGES
  @Get('stages')
  listStages(@Query() query: any, @Req() req: any) {
    return this.campeonatoService.listStages(this.resolveCompanyId(req), query);
  }
  @Get('stages/:id')
  getStage(@Param('id') id: string) {
    return this.campeonatoService.getStage(id);
  }
  @Post('stages')
  createStage(@Body() dto: any, @Req() req: any) {
    return this.campeonatoService.createStage(dto, req.user, this.resolveCompanyId(req));
  }
  @Patch('stages/:id')
  updateStage(@Param('id') id: string, @Body() dto: any, @Req() req: any) {
    return this.campeonatoService.updateStage(id, dto, req.user);
  }
  @Delete('stages/:id')
  removeStage(@Param('id') id: string) {
    return this.campeonatoService.removeStage(id);
  }

  // 10. SCENARIES
  @Get('scenaries')
  listScenaries(@Query() query: any, @Req() req: any) {
    return this.campeonatoService.listScenaries(this.resolveCompanyId(req), query);
  }
  @Get('scenaries/:id')
  getScenary(@Param('id') id: string) {
    return this.campeonatoService.getScenary(id);
  }
  @Post('scenaries')
  createScenary(@Body() dto: any, @Req() req: any) {
    return this.campeonatoService.createScenary(dto, req.user, this.resolveCompanyId(req));
  }
  @Patch('scenaries/:id')
  updateScenary(@Param('id') id: string, @Body() dto: any, @Req() req: any) {
    return this.campeonatoService.updateScenary(id, dto, req.user);
  }
  @Delete('scenaries/:id')
  removeScenary(@Param('id') id: string) {
    return this.campeonatoService.removeScenary(id);
  }

  // 11. TEAM REGISTRATIONS
  @Get('team-registrations')
  listTeamRegistrations(@Query() query: any, @Req() req: any) {
    return this.campeonatoService.listTeamRegistrations(this.resolveCompanyId(req), query);
  }
  @Get('team-registrations/:id')
  getTeamRegistration(@Param('id') id: string) {
    return this.campeonatoService.getTeamRegistration(id);
  }
  @Post('team-registrations')
  createTeamRegistration(@Body() dto: any, @Req() req: any) {
    return this.campeonatoService.createTeamRegistration(dto, req.user, this.resolveCompanyId(req));
  }
  @Patch('team-registrations/:id')
  updateTeamRegistration(@Param('id') id: string, @Body() dto: any, @Req() req: any) {
    return this.campeonatoService.updateTeamRegistration(id, dto, req.user);
  }
  @Delete('team-registrations/:id')
  removeTeamRegistration(@Param('id') id: string) {
    return this.campeonatoService.removeTeamRegistration(id);
  }

  // 12. PLAYER REGISTRATIONS
  @Get('player-registrations')
  listPlayerRegistrations(@Query() query: any, @Req() req: any) {
    return this.campeonatoService.listPlayerRegistrations(this.resolveCompanyId(req), query);
  }
  @Get('player-registrations/:id')
  getPlayerRegistration(@Param('id') id: string) {
    return this.campeonatoService.getPlayerRegistration(id);
  }
  @Post('player-registrations')
  createPlayerRegistration(@Body() dto: any, @Req() req: any) {
    return this.campeonatoService.createPlayerRegistration(dto, req.user, this.resolveCompanyId(req));
  }
  @Patch('player-registrations/:id')
  updatePlayerRegistration(@Param('id') id: string, @Body() dto: any, @Req() req: any) {
    return this.campeonatoService.updatePlayerRegistration(id, dto, req.user);
  }
  @Delete('player-registrations/:id')
  removePlayerRegistration(@Param('id') id: string) {
    return this.campeonatoService.removePlayerRegistration(id);
  }

  // 13. REFEREES
  @Get('referees')
  listReferees(@Query() query: any, @Req() req: any) {
    return this.campeonatoService.listReferees(this.resolveCompanyId(req), query);
  }
  @Get('referees/:id')
  getReferee(@Param('id') id: string) {
    return this.campeonatoService.getReferee(id);
  }
  @Post('referees')
  createReferee(@Body() dto: any, @Req() req: any) {
    return this.campeonatoService.createReferee(dto, req.user, this.resolveCompanyId(req));
  }
  @Patch('referees/:id')
  updateReferee(@Param('id') id: string, @Body() dto: any, @Req() req: any) {
    return this.campeonatoService.updateReferee(id, dto, req.user);
  }
  @Delete('referees/:id')
  removeReferee(@Param('id') id: string) {
    return this.campeonatoService.removeReferee(id);
  }

  // 14. VOCALS
  @Get('vocals')
  listVocals(@Query() query: any, @Req() req: any) {
    return this.campeonatoService.listVocals(this.resolveCompanyId(req), query);
  }
  @Get('vocals/:id')
  getVocal(@Param('id') id: string) {
    return this.campeonatoService.getVocal(id);
  }
  @Post('vocals')
  createVocal(@Body() dto: any, @Req() req: any) {
    return this.campeonatoService.createVocal(dto, req.user, this.resolveCompanyId(req));
  }
  @Patch('vocals/:id')
  updateVocal(@Param('id') id: string, @Body() dto: any, @Req() req: any) {
    return this.campeonatoService.updateVocal(id, dto, req.user);
  }
  @Delete('vocals/:id')
  removeVocal(@Param('id') id: string) {
    return this.campeonatoService.removeVocal(id);
  }

  // 15. MATCHES
  @Get('matches')
  listMatches(@Query() query: any, @Req() req: any) {
    return this.campeonatoService.listMatches(this.resolveCompanyId(req), query);
  }
  @Get('matches/:id')
  getMatch(@Param('id') id: string) {
    return this.campeonatoService.getMatch(id);
  }
  @Post('matches')
  createMatch(@Body() dto: any, @Req() req: any) {
    return this.campeonatoService.createMatch(dto, req.user, this.resolveCompanyId(req));
  }
  @Patch('matches/:id')
  updateMatch(@Param('id') id: string, @Body() dto: any, @Req() req: any) {
    return this.campeonatoService.updateMatch(id, dto, req.user);
  }
  @Delete('matches/:id')
  removeMatch(@Param('id') id: string) {
    return this.campeonatoService.removeMatch(id);
  }

  // 16. MATCH LINEUPS
  @Get('match-lineups')
  listMatchLineups(@Query() query: any, @Req() req: any) {
    return this.campeonatoService.listMatchLineups(this.resolveCompanyId(req), query);
  }
  @Get('match-lineups/:id')
  getMatchLineup(@Param('id') id: string) {
    return this.campeonatoService.getMatchLineup(id);
  }
  @Post('match-lineups')
  createMatchLineup(@Body() dto: any, @Req() req: any) {
    return this.campeonatoService.createMatchLineup(dto, req.user, this.resolveCompanyId(req));
  }
  @Patch('match-lineups/:id')
  updateMatchLineup(@Param('id') id: string, @Body() dto: any, @Req() req: any) {
    return this.campeonatoService.updateMatchLineup(id, dto, req.user);
  }
  @Delete('match-lineups/:id')
  removeMatchLineup(@Param('id') id: string) {
    return this.campeonatoService.removeMatchLineup(id);
  }

  // 17. MATCH EVENTS
  @Get('match-events')
  listMatchEvents(@Query() query: any, @Req() req: any) {
    return this.campeonatoService.listMatchEvents(this.resolveCompanyId(req), query);
  }
  @Get('match-events/:id')
  getMatchEvent(@Param('id') id: string) {
    return this.campeonatoService.getMatchEvent(id);
  }
  @Post('match-events')
  createMatchEvent(@Body() dto: any, @Req() req: any) {
    return this.campeonatoService.createMatchEvent(dto, req.user, this.resolveCompanyId(req));
  }
  @Patch('match-events/:id')
  updateMatchEvent(@Param('id') id: string, @Body() dto: any, @Req() req: any) {
    return this.campeonatoService.updateMatchEvent(id, dto, req.user);
  }
  @Delete('match-events/:id')
  removeMatchEvent(@Param('id') id: string) {
    return this.campeonatoService.removeMatchEvent(id);
  }

  // 18. SANCTIONS
  @Get('sanctions')
  listSanctions(@Query() query: any, @Req() req: any) {
    return this.campeonatoService.listSanctions(this.resolveCompanyId(req), query);
  }
  @Get('sanctions/:id')
  getSanction(@Param('id') id: string) {
    return this.campeonatoService.getSanction(id);
  }
  @Post('sanctions')
  createSanction(@Body() dto: any, @Req() req: any) {
    return this.campeonatoService.createSanction(dto, req.user, this.resolveCompanyId(req));
  }
  @Patch('sanctions/:id')
  updateSanction(@Param('id') id: string, @Body() dto: any, @Req() req: any) {
    return this.campeonatoService.updateSanction(id, dto, req.user);
  }
  @Delete('sanctions/:id')
  removeSanction(@Param('id') id: string) {
    return this.campeonatoService.removeSanction(id);
  }

  // 19. PAYMENTS
  @Get('payments')
  listPayments(@Query() query: any, @Req() req: any) {
    return this.campeonatoService.listPayments(this.resolveCompanyId(req), query);
  }
  @Get('payments/:id')
  getPayment(@Param('id') id: string) {
    return this.campeonatoService.getPayment(id);
  }
  @Post('payments')
  createPayment(@Body() dto: any, @Req() req: any) {
    return this.campeonatoService.createPayment(dto, req.user, this.resolveCompanyId(req));
  }
  @Patch('payments/:id')
  updatePayment(@Param('id') id: string, @Body() dto: any, @Req() req: any) {
    return this.campeonatoService.updatePayment(id, dto, req.user);
  }
  @Delete('payments/:id')
  removePayment(@Param('id') id: string) {
    return this.campeonatoService.removePayment(id);
  }
}
