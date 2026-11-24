import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { CategoryEditionOrmEntity } from '../../infrastructure/persistence/category-edition.orm-entity';
import { StageOrmEntity } from '../../infrastructure/persistence/stage.orm-entity';
import { ScenaryOrmEntity } from '../../infrastructure/persistence/scenary.orm-entity';
import { VocalOrmEntity } from '../../infrastructure/persistence/vocal.orm-entity';
import { assertBelongsToCompany, ensureCompanyScope } from '../../common/company-scope.util';
import { MatchOrmEntity } from '../../infrastructure/persistence/match.orm-entity';
import { TeamOrmEntity } from '../../infrastructure/persistence/team.orm-entity';
import { MatchEventOrmEntity } from '../../infrastructure/persistence/match-event.orm-entity';
import { TeamRegistrationOrmEntity } from '../../infrastructure/persistence/team-registration.orm-entity';
import { MatchStatus, MatchEventType, MeetingType, EditionStatus, RegistrationStatus, StageStatus, TeamOrigin } from '../../common/enum/campeonato.enum';
import { CreateMatchDto, GenerateFixtureDto, UpdateMatchDto } from './dto/match.dto';

// Tipos de competencia cuyo fixture es todos contra todos
const ROUND_ROBIN_CODES = ['TODOS_VS_TODOS', 'CUADRANGULAR'];

// El fixture de una categoría se genera cuando todos sus equipos están aprobados (la aprobación se gestiona en otro módulo)
const teamsBlockReason = (approvedCount: number, pendingCount: number): string | null => {
  if (pendingCount > 0) return 'Hay ' + pendingCount + ' equipo(s) pendiente(s) de aprobación en la categoría; el fixture se genera cuando todos estén aprobados.';
  if (approvedCount < 2) return 'Se requieren al menos 2 equipos aprobados en la categoría.';
  return null;
};

// Por qué una etapa en proceso no puede generar su fixture (nulo si puede)
const fixtureBlockReason = (stage: StageOrmEntity, approvedCount: number, pendingCount: number, matchesCount: number): string | null => {
  if (matchesCount > 0) return 'La etapa ya tiene partidos generados.';
  if (stage.teamOrigin === TeamOrigin.PREVIOUS_STAGE) return 'Sus equipos dependen de la clasificación de la etapa anterior; aún no se genera automáticamente.';
  if (stage.competitionTypeCode && !ROUND_ROBIN_CODES.includes(stage.competitionTypeCode)) return `El tipo de competencia ${stage.competitionTypeCode} aún no genera el fixture automáticamente.`;
  return teamsBlockReason(approvedCount, pendingCount);
};

// Todos contra todos (rotación de círculo). Con 2 vueltas o más, cada vuelta invierte las localías de la anterior.
const buildRoundRobin = (teamIds: number[], laps: number) => {
  const teams: (number | null)[] = [...teamIds];
  if (teams.length % 2 !== 0) teams.push(null); // descanso
  const size = teams.length;
  const roundsPerLap = size - 1;
  const firstLap: { round: number; home: number; away: number }[] = [];
  const current = [...teams];

  for (let round = 0; round < roundsPerLap; round++) {
    for (let i = 0; i < size / 2; i++) {
      const a = current[i];
      const b = current[size - 1 - i];
      if (a === null || b === null) continue;
      const [home, away] = round % 2 === 0 ? [a, b] : [b, a];
      firstLap.push({ round: round + 1, home, away });
    }
    const fixed = current[0];
    const rest = current.slice(1);
    rest.unshift(rest.pop()!);
    current.splice(0, current.length, fixed, ...rest);
  }

  const matches: { roundNumber: number; home: number; away: number; meetingType: MeetingType }[] = [];
  for (let lap = 1; lap <= laps; lap++) {
    for (const match of firstLap) {
      matches.push({
        roundNumber: match.round + (lap - 1) * roundsPerLap,
        home: lap % 2 === 1 ? match.home : match.away,
        away: lap % 2 === 1 ? match.away : match.home,
        meetingType: laps === 1 ? MeetingType.UNICO : lap % 2 === 1 ? MeetingType.IDA : MeetingType.VUELTA,
      });
    }
  }

  return { matches, roundsCount: roundsPerLap * laps };
};

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
    @InjectRepository(CategoryEditionOrmEntity)
    private readonly editionRepo: Repository<CategoryEditionOrmEntity>,
    @InjectRepository(StageOrmEntity)
    private readonly stageRepo: Repository<StageOrmEntity>,
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

  /**
   * Lo que muestra el formulario del fixture: por cada campeonato iniciado, las etapas en proceso con su categoría,
   * los equipos inscritos y si ya se puede generar su fixture.
   */
  async getFixtureOptions(companyId: number) {
    const editions = await this.editionRepo
      .createQueryBuilder('ce')
      .where('ce.companyId = :companyId', { companyId })
      .andWhere('ce.startedAt IS NOT NULL')
      .andWhere('ce.status = :status', { status: EditionStatus.IN_PROGRESS })
      .orderBy('ce.name', 'ASC')
      .getMany();
    if (editions.length === 0) return [];

    const editionIds = editions.map((edition) => edition.id);
    const stages = await this.stageRepo.find({
      where: { categoryEditionId: In(editionIds), status: StageStatus.IN_PROGRESS },
      relations: ['category'],
      order: { stageOrder: 'ASC' },
    });

    const registrations = await this.teamRegRepo.find({ where: { categoryEditionId: In(editionIds) } });
    const matchCounts = stages.length
      ? await this.repo
          .createQueryBuilder('m')
          .select('m.stageId', 'stageId')
          .addSelect('COUNT(*)', 'total')
          .where('m.stageId IN (:...stageIds)', { stageIds: stages.map((stage) => stage.id) })
          .groupBy('m.stageId')
          .getRawMany<{ stageId: number; total: string }>()
      : [];

    return editions.map((edition) => ({
      id: edition.id,
      name: edition.name,
      startedAt: edition.startedAt,
      stages: stages
        .filter((stage) => Number(stage.categoryEditionId) === Number(edition.id))
        .map((stage) => {
          const categoryRegistrations = registrations.filter((r) => Number(r.categoryEditionId) === Number(edition.id) && Number(r.categoryId) === Number(stage.categoryId));
          const teamsCount = categoryRegistrations.filter((r) => r.status === RegistrationStatus.APPROVED).length;
          const pendingTeamsCount = categoryRegistrations.filter((r) => r.status === RegistrationStatus.PENDING).length;
          const matchesCount = Number(matchCounts.find((row) => Number(row.stageId) === Number(stage.id))?.total) || 0;
          const reason = fixtureBlockReason(stage, teamsCount, pendingTeamsCount, matchesCount);
          return {
            id: stage.id,
            name: stage.name,
            stageOrder: stage.stageOrder,
            categoryId: stage.categoryId,
            categoryName: stage.category?.name ?? '',
            competitionTypeCode: stage.competitionTypeCode,
            numberOfLaps: stage.numberOfLaps,
            teamsCount,
            pendingTeamsCount,
            matchesCount,
            canGenerate: reason === null,
            reason,
          };
        }),
    }));
  }

  /**
   * Genera los partidos (solo los encuentros: sin días, horarios ni canchas) de la etapa en proceso de cada categoría
   * de las ediciones indicadas.
   */
  async generateFixture(companyId: number, dto: GenerateFixtureDto, user: any) {
    const editionIds = [...new Set((dto.editionIds || []).map((id) => Number(id)))];
    if (editionIds.length === 0) throw new BadRequestException('Seleccione al menos una edición del torneo');

    const options = await this.getFixtureOptions(companyId);
    const selected = options.filter((option) => editionIds.includes(Number(option.id)));
    if (selected.length !== editionIds.length) {
      throw new BadRequestException('Alguna de las ediciones seleccionadas no existe o no tiene el campeonato iniciado.');
    }

    const actor = { createdBy: user?.user_id?.toString() || user?.id?.toString(), createdName: user?.user_name || user?.name };
    const results: { editionId: number; editionName: string; stageName: string; categoryName: string; generated: boolean; matchesCount: number; roundsCount: number; reason?: string }[] = [];

    await this.repo.manager.transaction(async (manager) => {
      const matchRepo = manager.getRepository(MatchOrmEntity);

      for (const edition of selected) {
        for (const stage of edition.stages) {
          const base = { editionId: edition.id, editionName: edition.name, stageName: stage.name, categoryName: stage.categoryName, generated: false, matchesCount: 0, roundsCount: 0 };
          if (!stage.canGenerate) {
            results.push({ ...base, reason: stage.reason ?? undefined });
            continue;
          }
          // Se vuelve a comprobar dentro de la transacción: otra generación pudo crear los partidos mientras tanto
          if ((await matchRepo.count({ where: { stageId: stage.id } })) > 0) {
            results.push({ ...base, reason: 'La etapa ya tiene partidos generados.' });
            continue;
          }

          // Se vuelve a comprobar con los datos actuales: una inscripción pudo quedar pendiente mientras tanto
          const categoryRegistrations = await manager.getRepository(TeamRegistrationOrmEntity).find({ where: { categoryEditionId: edition.id, categoryId: stage.categoryId } });
          const approved = categoryRegistrations.filter((r) => r.status === RegistrationStatus.APPROVED);
          const teamsReason = teamsBlockReason(approved.length, categoryRegistrations.filter((r) => r.status === RegistrationStatus.PENDING).length);
          if (teamsReason) {
            results.push({ ...base, reason: teamsReason });
            continue;
          }
          const { matches, roundsCount } = buildRoundRobin([...new Set(approved.map((r) => Number(r.teamId)))], Number(stage.numberOfLaps) || 1);

          await matchRepo.save(
            matches.map((match) =>
              matchRepo.create({
                companyId,
                stageId: stage.id,
                localTeamId: match.home,
                awayTeamId: match.away,
                roundNumber: match.roundNumber,
                meetingType: match.meetingType,
                status: MatchStatus.SCHEDULED,
                homeGoals: 0,
                awayGoals: 0,
                ...actor,
              }),
            ),
            { chunk: 200 },
          );
          results.push({ ...base, generated: true, matchesCount: matches.length, roundsCount });
        }
      }
    });

    const generated = results.filter((result) => result.generated);
    if (generated.length === 0) {
      throw new BadRequestException(`No se generó ningún fixture. ${results.map((r) => `${r.editionName} · ${r.categoryName} · ${r.stageName}: ${r.reason}`).join(' | ') || 'Las ediciones no tienen etapas en proceso.'}`);
    }

    const matchesCount = generated.reduce((total, result) => total + result.matchesCount, 0);
    return {
      success: true,
      message: `Fixture generado: ${matchesCount} partido(s) en ${generated.length} etapa(s).`,
      matchesCount,
      results,
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
