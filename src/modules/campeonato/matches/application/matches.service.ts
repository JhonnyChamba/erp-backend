import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { StageOrmEntity } from '../../infrastructure/persistence/stage.orm-entity';
import { ScenaryOrmEntity } from '../../infrastructure/persistence/scenary.orm-entity';
import { VocalOrmEntity } from '../../infrastructure/persistence/vocal.orm-entity';
import { assertBelongsToCompany, ensureCompanyScope } from '../../common/company-scope.util';
import { MatchOrmEntity } from '../../infrastructure/persistence/match.orm-entity';
import { TeamOrmEntity } from '../../infrastructure/persistence/team.orm-entity';
import { MatchEventOrmEntity } from '../../infrastructure/persistence/match-event.orm-entity';
import { TeamRegistrationOrmEntity } from '../../infrastructure/persistence/team-registration.orm-entity';
import { MatchStatus, MatchEventType } from '../../common/enum/campeonato.enum';
import { CreateMatchDto, GenerateFixtureDto, UpdateMatchDto } from './dto/match.dto';

@Injectable()
export class MatchesService {
  constructor(
    @InjectRepository(MatchOrmEntity)
    private readonly repo: Repository<MatchOrmEntity>,
    @InjectRepository(TeamOrmEntity)
    private readonly teamRepo: Repository<TeamOrmEntity>,
    @InjectRepository(MatchEventOrmEntity)
    private readonly eventRepo: Repository<MatchEventOrmEntity>,
    @InjectRepository(TeamRegistrationOrmEntity)
    private readonly teamRegRepo: Repository<TeamRegistrationOrmEntity>,
  ) {}

  async list(companyId: number, query: { page?: number; limit?: number; search?: string; stageId?: string }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const qb = this.repo
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.stage', 'stage')
      .leftJoinAndSelect('m.scenary', 'scenary')
      .leftJoinAndSelect('m.localTeam', 'localTeam')
      .leftJoinAndSelect('m.awayTeam', 'awayTeam')
      .leftJoinAndSelect('m.referee', 'referee')
      .leftJoinAndSelect('m.vocal', 'vocal')
      .leftJoinAndSelect('m.vocalTeam', 'vocalTeam');

    if (companyId) {
      qb.andWhere('(m.companyId = :companyId OR m.companyId IS NULL)', { companyId });
    }
    if (query.stageId) {
      qb.andWhere('m.stageId = :stageId', { stageId: query.stageId });
    }
    if (query.search?.trim()) {
      qb.andWhere(
        '(LOWER(localTeam.name) LIKE :term OR LOWER(awayTeam.name) LIKE :term OR LOWER(m.llaveId) LIKE :term)',
        { term: `%${query.search.trim().toLowerCase()}%` },
      );
    }

    qb.orderBy('m.roundNumber', 'ASC').addOrderBy('m.date', 'ASC').skip(skip).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getStandings(companyId: number, query: { stageId?: string }) {
    const qb = this.repo
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.localTeam', 'localTeam')
      .leftJoinAndSelect('m.awayTeam', 'awayTeam')
      .where('m.status IN (:...statuses)', { statuses: [MatchStatus.FINISHED, MatchStatus.WALKOVER] });

    if (companyId) {
      qb.andWhere('(m.companyId = :companyId OR m.companyId IS NULL)', { companyId });
    }
    if (query.stageId) {
      qb.andWhere('m.stageId = :stageId', { stageId: query.stageId });
    }

    const matches = await qb.getMany();

    // Obtener todos los equipos inscritos si se filtra por etapa
    const teamMap: Record<string, {
      teamId: string | number;
      teamName: string;
      logoUrl: string | null;
      pj: number;
      pg: number;
      pe: number;
      pp: number;
      gf: number;
      gc: number;
      gd: number;
      pts: number;
    }> = {};

    // Inicializar con equipos de partidos o registros
    for (const m of matches) {
      if (m.localTeam && !teamMap[m.localTeam.id]) {
        teamMap[m.localTeam.id] = {
          teamId: m.localTeam.id,
          teamName: m.localTeam.name,
          logoUrl: (m.localTeam as any).logo || null,
          pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, gd: 0, pts: 0,
        };
      }
      if (m.awayTeam && !teamMap[m.awayTeam.id]) {
        teamMap[m.awayTeam.id] = {
          teamId: m.awayTeam.id,
          teamName: m.awayTeam.name,
          logoUrl: (m.awayTeam as any).logo || null,
          pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, gd: 0, pts: 0,
        };
      }
    }

    // Calcular estadísticas de partidos
    for (const m of matches) {
      const local = teamMap[m.localTeamId];
      const away = teamMap[m.awayTeamId];
      if (!local || !away) continue;

      const hG = Number(m.homeGoals) || 0;
      const aG = Number(m.awayGoals) || 0;

      local.pj += 1;
      away.pj += 1;
      local.gf += hG;
      local.gc += aG;
      away.gf += aG;
      away.gc += hG;

      if (hG > aG) {
        local.pg += 1;
        local.pts += 3;
        away.pp += 1;
      } else if (hG < aG) {
        away.pg += 1;
        away.pts += 3;
        local.pp += 1;
      } else {
        local.pe += 1;
        local.pts += 1;
        away.pe += 1;
        away.pts += 1;
      }
    }

    // Calcular diferencia de goles y ordenar
    const standings = Object.values(teamMap).map((t) => {
      t.gd = t.gf - t.gc;
      return t;
    }).sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts;
      if (b.gd !== a.gd) return b.gd - a.gd;
      if (b.gf !== a.gf) return b.gf - a.gf;
      return a.teamName.localeCompare(b.teamName);
    });

    // Top Goleadores de la etapa
    const matchIds = matches.map((m) => m.id);
    let topScorers: any[] = [];
    if (matchIds.length > 0) {
      const events = await this.eventRepo
        .createQueryBuilder('ev')
        .leftJoinAndSelect('ev.player', 'player')
        .leftJoinAndSelect('ev.team', 'team')
        .where('ev.matchId IN (:...matchIds)', { matchIds })
        .andWhere('ev.eventType IN (:...eventTypes)', { eventTypes: [MatchEventType.GOAL, MatchEventType.PENALTY_GOAL] })
        .getMany();

      const scorerMap: Record<string, { playerId: string | number; playerName: string; teamName: string; goals: number }> = {};
      for (const ev of events) {
        if (!ev.player) continue;
        if (!scorerMap[ev.player.id]) {
          scorerMap[ev.player.id] = {
            playerId: ev.player.id,
            playerName: `${ev.player.name} ${ev.player.lastName || ''}`.trim(),
            teamName: ev.team?.name || 'Equipo',
            goals: 0,
          };
        }
        scorerMap[ev.player.id].goals += 1;
      }
      topScorers = Object.values(scorerMap).sort((a, b) => b.goals - a.goals).slice(0, 10);
    }

    return { standings, topScorers, totalMatchesPlayed: matches.length };
  }

  async generateFixture(companyId: number, dto: GenerateFixtureDto, user: any) {
    if (!dto.stageId) throw new BadRequestException('Debe indicar la etapa del campeonato');
    const teamIds = [...new Set((dto.teamIds || []).map((id) => Number(id)))];
    if (teamIds.length < 2) {
      throw new BadRequestException('Se requieren al menos 2 equipos distintos para generar el fixture');
    }
    if (dto.startDate && Number.isNaN(new Date(dto.startDate).getTime())) {
      throw new BadRequestException('La fecha de inicio del fixture no es válida');
    }

    // La etapa, el escenario y todos los equipos deben pertenecer a la empresa activa
    await this.assertReferences({ stageId: dto.stageId, scenaryId: dto.scenaryId }, companyId);
    const ownedTeams = await this.teamRepo.find({ where: { id: In(teamIds) } });
    for (const teamId of teamIds) {
      ensureCompanyScope(ownedTeams.find((t) => Number(t.id) === teamId), companyId, 'Equipo no encontrado');
    }

    const teams: number[] = [...teamIds];
    // Si la cantidad es impar, añadir null como descanso (BYE)
    if (teams.length % 2 !== 0) {
      teams.push(null as any);
    }

    const n = teams.length;
    const roundsCount = n - 1;
    const matchesPerRound = n / 2;
    const intervalDays = dto.intervalDays || 7;
    const durationMin = dto.matchDurationMinutes || 90;
    const baseDate = new Date(dto.startDate || new Date());
    const numberOfLaps = Number(dto.numberOfLaps) === 2 ? 2 : 1;

    const createdMatches: MatchOrmEntity[] = [];

    // Algoritmo de Round-Robin (Rotación de círculo)
    const currentTeams = [...teams];
    for (let round = 0; round < roundsCount; round++) {
      const roundDate = new Date(baseDate.getTime() + round * intervalDays * 24 * 60 * 60 * 1000);

      for (let i = 0; i < matchesPerRound; i++) {
        const teamA = currentTeams[i];
        const teamB = currentTeams[n - 1 - i];

        if (!teamA || !teamB) continue; // Descanso

        // Alternar local / visitante según la fecha
        const [localId, awayId] = round % 2 === 0 ? [teamA, teamB] : [teamB, teamA];

        const matchTime = new Date(roundDate.getTime() + i * durationMin * 60 * 1000);

        const match = this.repo.create({
          companyId,
          stageId: Number(dto.stageId),
          scenaryId: dto.scenaryId ? Number(dto.scenaryId) : null,
          localTeamId: Number(localId),
          awayTeamId: Number(awayId),
          roundNumber: round + 1,
          date: matchTime,
          status: MatchStatus.SCHEDULED,
          homeGoals: 0,
          awayGoals: 0,
          createdBy: user?.user_id?.toString() || user?.id?.toString(),
          createdName: user?.user_name || user?.name,
        });

        createdMatches.push(match);
      }

      // Rotar: el primer elemento se queda fijo, los demás rotan en sentido horario
      const fixed = currentTeams[0];
      const rest = currentTeams.slice(1);
      const last = rest.pop()!;
      rest.unshift(last);
      currentTeams.splice(0, currentTeams.length, fixed, ...rest);
    }

    // Si se especificó 2 vueltas (Ida y Vuelta): generar los partidos de revancha invirtiendo localías
    if (numberOfLaps === 2) {
      const firstLapMatches = [...createdMatches];
      for (const m of firstLapMatches) {
        const returnRound = m.roundNumber + roundsCount;
        const returnDate = new Date(m.date.getTime() + roundsCount * intervalDays * 24 * 60 * 60 * 1000);
        const returnMatch = this.repo.create({
          companyId,
          stageId: Number(dto.stageId),
          scenaryId: m.scenaryId,
          localTeamId: m.awayTeamId,
          awayTeamId: m.localTeamId,
          roundNumber: returnRound,
          date: returnDate,
          status: MatchStatus.SCHEDULED,
          homeGoals: 0,
          awayGoals: 0,
          createdBy: user?.user_id?.toString() || user?.id?.toString(),
          createdName: user?.user_name || user?.name,
        });
        createdMatches.push(returnMatch);
      }
    }

    const saved = await this.repo.save(createdMatches);
    const totalRounds = numberOfLaps === 2 ? roundsCount * 2 : roundsCount;
    return {
      success: true,
      message: `Fixture generado exitosamente con ${saved.length} encuentros en ${totalRounds} jornadas (${numberOfLaps === 2 ? 'Ida y Vuelta' : 'Solo Ida'}).`,
      matchesCount: saved.length,
      roundsCount: totalRounds,
    };
  }

  async get(id: string | number, companyId: number, write = false) {
    const item = await this.repo.findOne({
      where: { id: Number(id) },
      relations: ['stage', 'scenary', 'localTeam', 'awayTeam', 'referee', 'vocal', 'vocalTeam'],
    });
    return ensureCompanyScope(item, companyId, 'Partido no encontrado', write);
  }

  /** Los ids recibidos en el body deben pertenecer a la empresa activa. */
  private async assertReferences(
    dto: Pick<UpdateMatchDto, 'stageId' | 'scenaryId' | 'localTeamId' | 'awayTeamId' | 'winnerTeamId' | 'vocalTeamId' | 'vocalId'>,
    companyId: number,
  ) {
    await assertBelongsToCompany(this.repo.manager.getRepository(StageOrmEntity), dto.stageId, companyId, 'Etapa no encontrada');
    await assertBelongsToCompany(this.repo.manager.getRepository(ScenaryOrmEntity), dto.scenaryId, companyId, 'Escenario no encontrado');
    await assertBelongsToCompany(this.repo.manager.getRepository(VocalOrmEntity), dto.vocalId, companyId, 'Vocal no encontrado');
    for (const teamId of [dto.localTeamId, dto.awayTeamId, dto.winnerTeamId, dto.vocalTeamId]) {
      await assertBelongsToCompany(this.teamRepo, teamId, companyId, 'Equipo no encontrado');
    }
  }

  async create(dto: CreateMatchDto, user: any, companyId: number) {
    await this.assertReferences(dto, companyId);
    const item = this.repo.create({
      ...dto,
      date: new Date(dto.date),
      companyId,
      createdBy: user?.user_id?.toString() || user?.id?.toString(),
      createdName: user?.user_name || user?.name,
    });
    return this.repo.save(item);
  }

  async update(id: string | number, dto: UpdateMatchDto, user: any, companyId: number) {
    const item = await this.get(id, companyId, true);
    await this.assertReferences(dto, companyId);
    Object.assign(item, dto, {
      date: dto.date ? new Date(dto.date) : item.date,
      updatedBy: user?.user_id?.toString() || user?.id?.toString(),
      updateName: user?.user_name || user?.name,
    });
    return this.repo.save(item);
  }

  async remove(id: string | number, companyId: number) {
    const item = await this.get(id, companyId, true);
    return this.repo.remove(item);
  }
}
