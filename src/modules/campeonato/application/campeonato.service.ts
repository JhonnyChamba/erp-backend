import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';

import { PositionOrmEntity } from '../infrastructure/persistence/position.orm-entity';
import { DemarcationOrmEntity } from '../infrastructure/persistence/demarcation.orm-entity';
import { TeamOrmEntity } from '../infrastructure/persistence/team.orm-entity';
import { PlayerOrmEntity } from '../infrastructure/persistence/player.orm-entity';
import { TournamentCommitteeOrmEntity } from '../infrastructure/persistence/tournament-committee.orm-entity';
import { TeamManagementOrmEntity } from '../infrastructure/persistence/team-management.orm-entity';
import { CategoryOrmEntity } from '../infrastructure/persistence/category.orm-entity';
import { CategoryEditionOrmEntity } from '../infrastructure/persistence/category-edition.orm-entity';
import { StageOrmEntity } from '../infrastructure/persistence/stage.orm-entity';
import { ScenaryOrmEntity } from '../infrastructure/persistence/scenary.orm-entity';
import { TeamRegistrationOrmEntity } from '../infrastructure/persistence/team-registration.orm-entity';
import { PlayerRegistrationOrmEntity } from '../infrastructure/persistence/player-registration.orm-entity';
import { RefereeOrmEntity } from '../infrastructure/persistence/referee.orm-entity';
import { VocalOrmEntity } from '../infrastructure/persistence/vocal.orm-entity';
import { MatchOrmEntity } from '../infrastructure/persistence/match.orm-entity';
import { MatchLineupOrmEntity } from '../infrastructure/persistence/match-lineup.orm-entity';
import { MatchEventOrmEntity } from '../infrastructure/persistence/match-event.orm-entity';
import { SanctionOrmEntity } from '../infrastructure/persistence/sanction.orm-entity';
import { PaymentOrmEntity } from '../infrastructure/persistence/payment.orm-entity';

@Injectable()
export class CampeonatoService {
  constructor(
    @InjectRepository(PositionOrmEntity)
    public readonly positionRepo: Repository<PositionOrmEntity>,

    @InjectRepository(DemarcationOrmEntity)
    public readonly demarcationRepo: Repository<DemarcationOrmEntity>,

    @InjectRepository(TeamOrmEntity)
    public readonly teamRepo: Repository<TeamOrmEntity>,

    @InjectRepository(PlayerOrmEntity)
    public readonly playerRepo: Repository<PlayerOrmEntity>,

    @InjectRepository(TournamentCommitteeOrmEntity)
    public readonly committeeRepo: Repository<TournamentCommitteeOrmEntity>,

    @InjectRepository(TeamManagementOrmEntity)
    public readonly teamManagementRepo: Repository<TeamManagementOrmEntity>,

    @InjectRepository(CategoryOrmEntity)
    public readonly categoryRepo: Repository<CategoryOrmEntity>,

    @InjectRepository(CategoryEditionOrmEntity)
    public readonly categoryEditionRepo: Repository<CategoryEditionOrmEntity>,

    @InjectRepository(StageOrmEntity)
    public readonly stageRepo: Repository<StageOrmEntity>,

    @InjectRepository(ScenaryOrmEntity)
    public readonly scenaryRepo: Repository<ScenaryOrmEntity>,

    @InjectRepository(TeamRegistrationOrmEntity)
    public readonly teamRegistrationRepo: Repository<TeamRegistrationOrmEntity>,

    @InjectRepository(PlayerRegistrationOrmEntity)
    public readonly playerRegistrationRepo: Repository<PlayerRegistrationOrmEntity>,

    @InjectRepository(RefereeOrmEntity)
    public readonly refereeRepo: Repository<RefereeOrmEntity>,

    @InjectRepository(VocalOrmEntity)
    public readonly vocalRepo: Repository<VocalOrmEntity>,

    @InjectRepository(MatchOrmEntity)
    public readonly matchRepo: Repository<MatchOrmEntity>,

    @InjectRepository(MatchLineupOrmEntity)
    public readonly matchLineupRepo: Repository<MatchLineupOrmEntity>,

    @InjectRepository(MatchEventOrmEntity)
    public readonly matchEventRepo: Repository<MatchEventOrmEntity>,

    @InjectRepository(SanctionOrmEntity)
    public readonly sanctionRepo: Repository<SanctionOrmEntity>,

    @InjectRepository(PaymentOrmEntity)
    public readonly paymentRepo: Repository<PaymentOrmEntity>,
  ) {}

  // Helper genérico para paginación y búsqueda
  private async genericFind<T>(
    repo: Repository<T>,
    companyId: number,
    query: { page?: number; limit?: number; search?: string },
    searchFields: string[] = ['name'],
    relations: string[] = [],
  ) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const qb = repo.createQueryBuilder('e');
    if (companyId) {
      qb.andWhere('(e.companyId = :companyId OR e.companyId IS NULL)', { companyId });
    }

    if (query.search && query.search.trim()) {
      const term = `%${query.search.trim().toLowerCase()}%`;
      const searchClauses = searchFields.map((f) => `LOWER(CAST(e.${f} AS TEXT)) LIKE :term`);
      qb.andWhere(`(${searchClauses.join(' OR ')})`, { term });
    }

    relations.forEach((rel) => {
      qb.leftJoinAndSelect(`e.${rel}`, rel);
    });

    qb.orderBy('e.createdAt', 'DESC').skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  // ================= 1. POSITIONS =================
  listPositions(companyId: number, query: any) {
    return this.genericFind(this.positionRepo, companyId, query, ['name', 'code']);
  }
  async getPosition(id: string) {
    const item = await this.positionRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Cargo no encontrado');
    return item;
  }
  createPosition(dto: Partial<PositionOrmEntity>, user: any, companyId: number) {
    const item = this.positionRepo.create({
      ...dto,
      companyId,
      createdBy: user?.user_id?.toString() || user?.id?.toString(),
      createdName: user?.user_name || user?.name,
    });
    return this.positionRepo.save(item);
  }
  async updatePosition(id: string, dto: Partial<PositionOrmEntity>, user: any) {
    const item = await this.getPosition(id);
    Object.assign(item, dto, {
      updatedBy: user?.user_id?.toString() || user?.id?.toString(),
      updateName: user?.user_name || user?.name,
    });
    return this.positionRepo.save(item);
  }
  async removePosition(id: string) {
    const item = await this.getPosition(id);
    return this.positionRepo.remove(item);
  }

  // ================= 2. DEMARCATIONS =================
  listDemarcations(companyId: number, query: any) {
    return this.genericFind(this.demarcationRepo, companyId, query, ['name', 'code']);
  }
  async getDemarcation(id: string) {
    const item = await this.demarcationRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Demarcación no encontrada');
    return item;
  }
  createDemarcation(dto: Partial<DemarcationOrmEntity>, user: any, companyId: number) {
    const item = this.demarcationRepo.create({
      ...dto,
      companyId,
      createdBy: user?.user_id?.toString() || user?.id?.toString(),
      createdName: user?.user_name || user?.name,
    });
    return this.demarcationRepo.save(item);
  }
  async updateDemarcation(id: string, dto: Partial<DemarcationOrmEntity>, user: any) {
    const item = await this.getDemarcation(id);
    Object.assign(item, dto, {
      updatedBy: user?.user_id?.toString() || user?.id?.toString(),
      updateName: user?.user_name || user?.name,
    });
    return this.demarcationRepo.save(item);
  }
  async removeDemarcation(id: string) {
    const item = await this.getDemarcation(id);
    return this.demarcationRepo.remove(item);
  }

  // ================= 3. TEAMS =================
  listTeams(companyId: number, query: any) {
    return this.genericFind(this.teamRepo, companyId, query, ['name', 'shortName', 'acronyms']);
  }
  async getTeam(id: string) {
    const item = await this.teamRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Equipo no encontrado');
    return item;
  }
  createTeam(dto: Partial<TeamOrmEntity>, user: any, companyId: number) {
    const item = this.teamRepo.create({
      ...dto,
      companyId,
      createdBy: user?.user_id?.toString() || user?.id?.toString(),
      createdName: user?.user_name || user?.name,
    });
    return this.teamRepo.save(item);
  }
  async updateTeam(id: string, dto: Partial<TeamOrmEntity>, user: any) {
    const item = await this.getTeam(id);
    Object.assign(item, dto, {
      updatedBy: user?.user_id?.toString() || user?.id?.toString(),
      updateName: user?.user_name || user?.name,
    });
    return this.teamRepo.save(item);
  }
  async removeTeam(id: string) {
    const item = await this.getTeam(id);
    return this.teamRepo.remove(item);
  }

  // ================= 4. PLAYERS =================
  listPlayers(companyId: number, query: any) {
    return this.genericFind(this.playerRepo, companyId, query, ['name', 'lastName', 'identification'], ['demarcation']);
  }
  async getPlayer(id: string) {
    const item = await this.playerRepo.findOne({ where: { id }, relations: ['demarcation'] });
    if (!item) throw new NotFoundException('Jugador no encontrado');
    return item;
  }
  createPlayer(dto: Partial<PlayerOrmEntity>, user: any, companyId: number) {
    const item = this.playerRepo.create({
      ...dto,
      companyId,
      createdBy: user?.user_id?.toString() || user?.id?.toString(),
      createdName: user?.user_name || user?.name,
    });
    return this.playerRepo.save(item);
  }
  async updatePlayer(id: string, dto: Partial<PlayerOrmEntity>, user: any) {
    const item = await this.getPlayer(id);
    Object.assign(item, dto, {
      updatedBy: user?.user_id?.toString() || user?.id?.toString(),
      updateName: user?.user_name || user?.name,
    });
    return this.playerRepo.save(item);
  }
  async removePlayer(id: string) {
    const item = await this.getPlayer(id);
    return this.playerRepo.remove(item);
  }

  // ================= 5. COMMITTEES =================
  listCommittees(companyId: number, query: any) {
    return this.genericFind(this.committeeRepo, companyId, query, ['name', 'lastName', 'identification'], ['position']);
  }
  async getCommittee(id: string) {
    const item = await this.committeeRepo.findOne({ where: { id }, relations: ['position'] });
    if (!item) throw new NotFoundException('Miembro de comité no encontrado');
    return item;
  }
  createCommittee(dto: Partial<TournamentCommitteeOrmEntity>, user: any, companyId: number) {
    const item = this.committeeRepo.create({
      ...dto,
      companyId,
      createdBy: user?.user_id?.toString() || user?.id?.toString(),
      createdName: user?.user_name || user?.name,
    });
    return this.committeeRepo.save(item);
  }
  async updateCommittee(id: string, dto: Partial<TournamentCommitteeOrmEntity>, user: any) {
    const item = await this.getCommittee(id);
    Object.assign(item, dto, {
      updatedBy: user?.user_id?.toString() || user?.id?.toString(),
      updateName: user?.user_name || user?.name,
    });
    return this.committeeRepo.save(item);
  }
  async removeCommittee(id: string) {
    const item = await this.getCommittee(id);
    return this.committeeRepo.remove(item);
  }

  // ================= 6. TEAM MANAGEMENTS =================
  listTeamManagements(companyId: number, query: any) {
    return this.genericFind(this.teamManagementRepo, companyId, query, ['name', 'lastName', 'identification'], ['position', 'team', 'player']);
  }
  async getTeamManagement(id: string) {
    const item = await this.teamManagementRepo.findOne({ where: { id }, relations: ['position', 'team', 'player'] });
    if (!item) throw new NotFoundException('Directivo/Técnico de equipo no encontrado');
    return item;
  }
  createTeamManagement(dto: Partial<TeamManagementOrmEntity>, user: any, companyId: number) {
    const item = this.teamManagementRepo.create({
      ...dto,
      companyId,
      createdBy: user?.user_id?.toString() || user?.id?.toString(),
      createdName: user?.user_name || user?.name,
    });
    return this.teamManagementRepo.save(item);
  }
  async updateTeamManagement(id: string, dto: Partial<TeamManagementOrmEntity>, user: any) {
    const item = await this.getTeamManagement(id);
    Object.assign(item, dto, {
      updatedBy: user?.user_id?.toString() || user?.id?.toString(),
      updateName: user?.user_name || user?.name,
    });
    return this.teamManagementRepo.save(item);
  }
  async removeTeamManagement(id: string) {
    const item = await this.getTeamManagement(id);
    return this.teamManagementRepo.remove(item);
  }

  // ================= 7. CATEGORIES =================
  listCategories(companyId: number, query: any) {
    return this.genericFind(this.categoryRepo, companyId, query, ['name', 'code']);
  }
  async getCategory(id: string) {
    const item = await this.categoryRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Categoría no encontrada');
    return item;
  }
  createCategory(dto: Partial<CategoryOrmEntity>, user: any, companyId: number) {
    const item = this.categoryRepo.create({
      ...dto,
      companyId,
      createdBy: user?.user_id?.toString() || user?.id?.toString(),
      createdName: user?.user_name || user?.name,
    });
    return this.categoryRepo.save(item);
  }
  async updateCategory(id: string, dto: Partial<CategoryOrmEntity>, user: any) {
    const item = await this.getCategory(id);
    Object.assign(item, dto, {
      updatedBy: user?.user_id?.toString() || user?.id?.toString(),
      updateName: user?.user_name || user?.name,
    });
    return this.categoryRepo.save(item);
  }
  async removeCategory(id: string) {
    const item = await this.getCategory(id);
    return this.categoryRepo.remove(item);
  }

  // ================= 8. CATEGORY EDITIONS =================
  listCategoryEditions(companyId: number, query: any) {
    return this.genericFind(this.categoryEditionRepo, companyId, query, ['name'], ['category']);
  }
  async getCategoryEdition(id: string) {
    const item = await this.categoryEditionRepo.findOne({ where: { id }, relations: ['category'] });
    if (!item) throw new NotFoundException('Edición de categoría no encontrada');
    return item;
  }
  createCategoryEdition(dto: Partial<CategoryEditionOrmEntity>, user: any, companyId: number) {
    const item = this.categoryEditionRepo.create({
      ...dto,
      companyId,
      createdBy: user?.user_id?.toString() || user?.id?.toString(),
      createdName: user?.user_name || user?.name,
    });
    return this.categoryEditionRepo.save(item);
  }
  async updateCategoryEdition(id: string, dto: Partial<CategoryEditionOrmEntity>, user: any) {
    const item = await this.getCategoryEdition(id);
    Object.assign(item, dto, {
      updatedBy: user?.user_id?.toString() || user?.id?.toString(),
      updateName: user?.user_name || user?.name,
    });
    return this.categoryEditionRepo.save(item);
  }
  async removeCategoryEdition(id: string) {
    const item = await this.getCategoryEdition(id);
    return this.categoryEditionRepo.remove(item);
  }

  // ================= 9. STAGES =================
  listStages(companyId: number, query: any) {
    return this.genericFind(this.stageRepo, companyId, query, ['name'], ['categoryEdition']);
  }
  async getStage(id: string) {
    const item = await this.stageRepo.findOne({ where: { id }, relations: ['categoryEdition'] });
    if (!item) throw new NotFoundException('Etapa/Fase no encontrada');
    return item;
  }
  createStage(dto: Partial<StageOrmEntity>, user: any, companyId: number) {
    const item = this.stageRepo.create({
      ...dto,
      companyId,
      createdBy: user?.user_id?.toString() || user?.id?.toString(),
      createdName: user?.user_name || user?.name,
    });
    return this.stageRepo.save(item);
  }
  async updateStage(id: string, dto: Partial<StageOrmEntity>, user: any) {
    const item = await this.getStage(id);
    Object.assign(item, dto, {
      updatedBy: user?.user_id?.toString() || user?.id?.toString(),
      updateName: user?.user_name || user?.name,
    });
    return this.stageRepo.save(item);
  }
  async removeStage(id: string) {
    const item = await this.getStage(id);
    return this.stageRepo.remove(item);
  }

  // ================= 10. SCENARIES =================
  listScenaries(companyId: number, query: any) {
    return this.genericFind(this.scenaryRepo, companyId, query, ['name', 'location', 'code']);
  }
  async getScenary(id: string) {
    const item = await this.scenaryRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Escenario no encontrado');
    return item;
  }
  createScenary(dto: Partial<ScenaryOrmEntity>, user: any, companyId: number) {
    const item = this.scenaryRepo.create({
      ...dto,
      companyId,
      createdBy: user?.user_id?.toString() || user?.id?.toString(),
      createdName: user?.user_name || user?.name,
    });
    return this.scenaryRepo.save(item);
  }
  async updateScenary(id: string, dto: Partial<ScenaryOrmEntity>, user: any) {
    const item = await this.getScenary(id);
    Object.assign(item, dto, {
      updatedBy: user?.user_id?.toString() || user?.id?.toString(),
      updateName: user?.user_name || user?.name,
    });
    return this.scenaryRepo.save(item);
  }
  async removeScenary(id: string) {
    const item = await this.getScenary(id);
    return this.scenaryRepo.remove(item);
  }

  // ================= 11. TEAM REGISTRATIONS =================
  listTeamRegistrations(companyId: number, query: any) {
    return this.genericFind(this.teamRegistrationRepo, companyId, query, ['groupName'], ['categoryEdition', 'team']);
  }
  async getTeamRegistration(id: string) {
    const item = await this.teamRegistrationRepo.findOne({ where: { id }, relations: ['categoryEdition', 'team'] });
    if (!item) throw new NotFoundException('Inscripción de equipo no encontrada');
    return item;
  }
  createTeamRegistration(dto: Partial<TeamRegistrationOrmEntity>, user: any, companyId: number) {
    const item = this.teamRegistrationRepo.create({
      ...dto,
      companyId,
      createdBy: user?.user_id?.toString() || user?.id?.toString(),
      createdName: user?.user_name || user?.name,
    });
    return this.teamRegistrationRepo.save(item);
  }
  async updateTeamRegistration(id: string, dto: Partial<TeamRegistrationOrmEntity>, user: any) {
    const item = await this.getTeamRegistration(id);
    Object.assign(item, dto, {
      updatedBy: user?.user_id?.toString() || user?.id?.toString(),
      updateName: user?.user_name || user?.name,
    });
    return this.teamRegistrationRepo.save(item);
  }
  async removeTeamRegistration(id: string) {
    const item = await this.getTeamRegistration(id);
    return this.teamRegistrationRepo.remove(item);
  }

  // ================= 12. PLAYER REGISTRATIONS =================
  listPlayerRegistrations(companyId: number, query: any) {
    return this.genericFind(this.playerRegistrationRepo, companyId, query, ['carnetCode'], ['teamRegistration', 'teamRegistration.team', 'player']);
  }
  async getPlayerRegistration(id: string) {
    const item = await this.playerRegistrationRepo.findOne({ where: { id }, relations: ['teamRegistration', 'teamRegistration.team', 'player'] });
    if (!item) throw new NotFoundException('Inscripción de jugador no encontrada');
    return item;
  }
  createPlayerRegistration(dto: Partial<PlayerRegistrationOrmEntity>, user: any, companyId: number) {
    const item = this.playerRegistrationRepo.create({
      ...dto,
      companyId,
      createdBy: user?.user_id?.toString() || user?.id?.toString(),
      createdName: user?.user_name || user?.name,
    });
    return this.playerRegistrationRepo.save(item);
  }
  async updatePlayerRegistration(id: string, dto: Partial<PlayerRegistrationOrmEntity>, user: any) {
    const item = await this.getPlayerRegistration(id);
    Object.assign(item, dto, {
      updatedBy: user?.user_id?.toString() || user?.id?.toString(),
      updateName: user?.user_name || user?.name,
    });
    return this.playerRegistrationRepo.save(item);
  }
  async removePlayerRegistration(id: string) {
    const item = await this.getPlayerRegistration(id);
    return this.playerRegistrationRepo.remove(item);
  }

  // ================= 13. REFEREES =================
  listReferees(companyId: number, query: any) {
    return this.genericFind(this.refereeRepo, companyId, query, ['name', 'lastName', 'identification']);
  }
  async getReferee(id: string) {
    const item = await this.refereeRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Árbitro no encontrado');
    return item;
  }
  createReferee(dto: Partial<RefereeOrmEntity>, user: any, companyId: number) {
    const item = this.refereeRepo.create({
      ...dto,
      companyId,
      createdBy: user?.user_id?.toString() || user?.id?.toString(),
      createdName: user?.user_name || user?.name,
    });
    return this.refereeRepo.save(item);
  }
  async updateReferee(id: string, dto: Partial<RefereeOrmEntity>, user: any) {
    const item = await this.getReferee(id);
    Object.assign(item, dto, {
      updatedBy: user?.user_id?.toString() || user?.id?.toString(),
      updateName: user?.user_name || user?.name,
    });
    return this.refereeRepo.save(item);
  }
  async removeReferee(id: string) {
    const item = await this.getReferee(id);
    return this.refereeRepo.remove(item);
  }

  // ================= 14. VOCALS =================
  listVocals(companyId: number, query: any) {
    return this.genericFind(this.vocalRepo, companyId, query, ['name', 'lastName', 'identification'], ['team']);
  }
  async getVocal(id: string) {
    const item = await this.vocalRepo.findOne({ where: { id }, relations: ['team'] });
    if (!item) throw new NotFoundException('Vocal no encontrado');
    return item;
  }
  createVocal(dto: Partial<VocalOrmEntity>, user: any, companyId: number) {
    const item = this.vocalRepo.create({
      ...dto,
      companyId,
      createdBy: user?.user_id?.toString() || user?.id?.toString(),
      createdName: user?.user_name || user?.name,
    });
    return this.vocalRepo.save(item);
  }
  async updateVocal(id: string, dto: Partial<VocalOrmEntity>, user: any) {
    const item = await this.getVocal(id);
    Object.assign(item, dto, {
      updatedBy: user?.user_id?.toString() || user?.id?.toString(),
      updateName: user?.user_name || user?.name,
    });
    return this.vocalRepo.save(item);
  }
  async removeVocal(id: string) {
    const item = await this.getVocal(id);
    return this.vocalRepo.remove(item);
  }

  // ================= 15. MATCHES =================
  listMatches(companyId: number, query: any) {
    return this.genericFind(
      this.matchRepo,
      companyId,
      query,
      ['llaveId'],
      ['stage', 'scenary', 'localTeam', 'awayTeam', 'referee', 'vocal', 'vocalTeam'],
    );
  }
  async getMatch(id: string) {
    const item = await this.matchRepo.findOne({
      where: { id },
      relations: ['stage', 'scenary', 'localTeam', 'awayTeam', 'referee', 'vocal', 'vocalTeam'],
    });
    if (!item) throw new NotFoundException('Partido no encontrado');
    return item;
  }
  createMatch(dto: Partial<MatchOrmEntity>, user: any, companyId: number) {
    const item = this.matchRepo.create({
      ...dto,
      companyId,
      createdBy: user?.user_id?.toString() || user?.id?.toString(),
      createdName: user?.user_name || user?.name,
    });
    return this.matchRepo.save(item);
  }
  async updateMatch(id: string, dto: Partial<MatchOrmEntity>, user: any) {
    const item = await this.getMatch(id);
    Object.assign(item, dto, {
      updatedBy: user?.user_id?.toString() || user?.id?.toString(),
      updateName: user?.user_name || user?.name,
    });
    return this.matchRepo.save(item);
  }
  async removeMatch(id: string) {
    const item = await this.getMatch(id);
    return this.matchRepo.remove(item);
  }

  // ================= 16. MATCH LINEUPS =================
  listMatchLineups(companyId: number, query: any) {
    return this.genericFind(this.matchLineupRepo, companyId, query, [], ['match', 'team', 'player']);
  }
  async getMatchLineup(id: string) {
    const item = await this.matchLineupRepo.findOne({ where: { id }, relations: ['match', 'team', 'player'] });
    if (!item) throw new NotFoundException('Registro de alineación no encontrado');
    return item;
  }
  createMatchLineup(dto: Partial<MatchLineupOrmEntity>, user: any, companyId: number) {
    const item = this.matchLineupRepo.create({
      ...dto,
      companyId,
      createdBy: user?.user_id?.toString() || user?.id?.toString(),
      createdName: user?.user_name || user?.name,
    });
    return this.matchLineupRepo.save(item);
  }
  async updateMatchLineup(id: string, dto: Partial<MatchLineupOrmEntity>, user: any) {
    const item = await this.getMatchLineup(id);
    Object.assign(item, dto, {
      updatedBy: user?.user_id?.toString() || user?.id?.toString(),
      updateName: user?.user_name || user?.name,
    });
    return this.matchLineupRepo.save(item);
  }
  async removeMatchLineup(id: string) {
    const item = await this.getMatchLineup(id);
    return this.matchLineupRepo.remove(item);
  }

  // ================= 17. MATCH EVENTS =================
  listMatchEvents(companyId: number, query: any) {
    return this.genericFind(this.matchEventRepo, companyId, query, ['notes'], ['match', 'team', 'player', 'playerOut']);
  }
  async getMatchEvent(id: string) {
    const item = await this.matchEventRepo.findOne({ where: { id }, relations: ['match', 'team', 'player', 'playerOut'] });
    if (!item) throw new NotFoundException('Evento de partido no encontrado');
    return item;
  }
  createMatchEvent(dto: Partial<MatchEventOrmEntity>, user: any, companyId: number) {
    const item = this.matchEventRepo.create({
      ...dto,
      companyId,
      createdBy: user?.user_id?.toString() || user?.id?.toString(),
      createdName: user?.user_name || user?.name,
    });
    return this.matchEventRepo.save(item);
  }
  async updateMatchEvent(id: string, dto: Partial<MatchEventOrmEntity>, user: any) {
    const item = await this.getMatchEvent(id);
    Object.assign(item, dto, {
      updatedBy: user?.user_id?.toString() || user?.id?.toString(),
      updateName: user?.user_name || user?.name,
    });
    return this.matchEventRepo.save(item);
  }
  async removeMatchEvent(id: string) {
    const item = await this.getMatchEvent(id);
    return this.matchEventRepo.remove(item);
  }

  // ================= 18. SANCTIONS =================
  listSanctions(companyId: number, query: any) {
    return this.genericFind(this.sanctionRepo, companyId, query, ['description'], ['match', 'player']);
  }
  async getSanction(id: string) {
    const item = await this.sanctionRepo.findOne({ where: { id }, relations: ['match', 'player'] });
    if (!item) throw new NotFoundException('Sanción no encontrada');
    return item;
  }
  createSanction(dto: Partial<SanctionOrmEntity>, user: any, companyId: number) {
    const item = this.sanctionRepo.create({
      ...dto,
      companyId,
      createdBy: user?.user_id?.toString() || user?.id?.toString(),
      createdName: user?.user_name || user?.name,
    });
    return this.sanctionRepo.save(item);
  }
  async updateSanction(id: string, dto: Partial<SanctionOrmEntity>, user: any) {
    const item = await this.getSanction(id);
    Object.assign(item, dto, {
      updatedBy: user?.user_id?.toString() || user?.id?.toString(),
      updateName: user?.user_name || user?.name,
    });
    return this.sanctionRepo.save(item);
  }
  async removeSanction(id: string) {
    const item = await this.getSanction(id);
    return this.sanctionRepo.remove(item);
  }

  // ================= 19. PAYMENTS =================
  listPayments(companyId: number, query: any) {
    return this.genericFind(this.paymentRepo, companyId, query, ['receiptNumber', 'notes'], ['teamRegistration', 'teamRegistration.team']);
  }
  async getPayment(id: string) {
    const item = await this.paymentRepo.findOne({ where: { id }, relations: ['teamRegistration', 'teamRegistration.team'] });
    if (!item) throw new NotFoundException('Pago no encontrado');
    return item;
  }
  createPayment(dto: Partial<PaymentOrmEntity>, user: any, companyId: number) {
    const item = this.paymentRepo.create({
      ...dto,
      companyId,
      createdBy: user?.user_id?.toString() || user?.id?.toString(),
      createdName: user?.user_name || user?.name,
    });
    return this.paymentRepo.save(item);
  }
  async updatePayment(id: string, dto: Partial<PaymentOrmEntity>, user: any) {
    const item = await this.getPayment(id);
    Object.assign(item, dto, {
      updatedBy: user?.user_id?.toString() || user?.id?.toString(),
      updateName: user?.user_name || user?.name,
    });
    return this.paymentRepo.save(item);
  }
  async removePayment(id: string) {
    const item = await this.getPayment(id);
    return this.paymentRepo.remove(item);
  }
}
