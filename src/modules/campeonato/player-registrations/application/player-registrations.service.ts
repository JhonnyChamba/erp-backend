import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, IsNull } from 'typeorm';
import { assertBelongsToCompany, assertPlayerInCompany, ensureCompanyScope, resolveUserId } from '../../common/company-scope.util';
import { PlayerRegistrationOrmEntity } from '../../infrastructure/persistence/player-registration.orm-entity';
import { PlayerOrmEntity } from '../../infrastructure/persistence/player.orm-entity';
import { TeamRegistrationOrmEntity } from '../../infrastructure/persistence/team-registration.orm-entity';
import { StageOrmEntity } from '../../infrastructure/persistence/stage.orm-entity';
import { EditionCategoryDetailOrmEntity } from '../../infrastructure/persistence/edition-category-detail.orm-entity';
import { TournamentTransferConfigOrmEntity } from '../../infrastructure/persistence/tournament-transfer-config.orm-entity';
import { PlayerRegistrationHistoryOrmEntity } from '../../infrastructure/persistence/player-registration-history.orm-entity';
import { DemarcationOrmEntity } from '../../infrastructure/persistence/demarcation.orm-entity';
import { PlayerRegistrationStatus, PlayerRegistrationHistoryAction } from '../../common/enum/campeonato.enum';
import {
  CreatePlayerRegistrationDto,
  UpdatePlayerRegistrationDto,
  MassPlayerRegistrationDto,
  UpdatePlayerRegistrationStatusDto,
  SyncTeamEditionRosterDto,
} from './dto/player-registration.dto';

@Injectable()
export class PlayerRegistrationsService {
  constructor(
    @InjectRepository(PlayerRegistrationOrmEntity)
    private readonly repo: Repository<PlayerRegistrationOrmEntity>,
    @InjectRepository(PlayerOrmEntity)
    private readonly playerRepo: Repository<PlayerOrmEntity>,
    @InjectRepository(TeamRegistrationOrmEntity)
    private readonly teamRegistrationRepo: Repository<TeamRegistrationOrmEntity>,
    @InjectRepository(StageOrmEntity)
    private readonly stageRepo: Repository<StageOrmEntity>,
    @InjectRepository(EditionCategoryDetailOrmEntity)
    private readonly editionCategoryDetailRepo: Repository<EditionCategoryDetailOrmEntity>,
    @InjectRepository(TournamentTransferConfigOrmEntity)
    private readonly transferConfigRepo: Repository<TournamentTransferConfigOrmEntity>,
    @InjectRepository(PlayerRegistrationHistoryOrmEntity)
    private readonly historyRepo: Repository<PlayerRegistrationHistoryOrmEntity>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Los ids recibidos en el body deben pertenecer a la empresa activa (el jugador, estar vinculado a ella).
   */
  private async assertReferences(
    companyId: number,
    refs: { teamRegistrationId?: number; stageId?: number; playerIds?: number[] },
  ) {
    await assertBelongsToCompany(this.teamRegistrationRepo, refs.teamRegistrationId, companyId, 'Inscripción de equipo no encontrada');
    await assertBelongsToCompany(this.stageRepo, refs.stageId, companyId, 'Etapa no encontrada');
    for (const playerId of refs.playerIds || []) {
      await assertPlayerInCompany(this.repo.manager, playerId, companyId);
    }
  }

  private async validateDemarcationLimit(
    playerId: string | number,
    teamRegistrationId: string | number,
    currentRegistrationId?: string | number,
    runnerRepo?: Repository<PlayerRegistrationOrmEntity>,
    demarcationId?: string | number | null,
  ) {
    if (!playerId || !teamRegistrationId) return;

    // La demarcación elegida en la inscripción manda; si no se eligió, se usa la del jugador
    let targetDemarcationId = demarcationId ? Number(demarcationId) : null;
    if (!targetDemarcationId) {
      const player = await this.playerRepo.findOne({ where: { id: Number(playerId) } });
      targetDemarcationId = player?.demarcationId ? Number(player.demarcationId) : null;
    }
    if (!targetDemarcationId) return;

    const demarcation = await this.repo.manager.getRepository(DemarcationOrmEntity).findOne({ where: { id: targetDemarcationId } });
    if (!demarcation) return;

    const maxAllowed = Number(demarcation.maxPlayers);

    if (!maxAllowed || maxAllowed <= 0) return;

    const repository = runnerRepo || this.repo;
    const qb = repository
      .createQueryBuilder('pr')
      .leftJoin('pr.player', 'p')
      .where('pr.teamRegistrationId = :teamRegistrationId', { teamRegistrationId })
      .andWhere('pr.status != :finalizedStatus', { finalizedStatus: PlayerRegistrationStatus.FINALIZED_BY_TRANSFER })
      // Demarcación efectiva: la de la inscripción o, en las inscripciones anteriores a esa columna, la del jugador
      .andWhere('COALESCE(pr.demarcationId, p.demarcationId) = :demarcationId', { demarcationId: demarcation.id });

    if (currentRegistrationId) {
      qb.andWhere('pr.id != :currentRegistrationId', { currentRegistrationId });
    }

    const count = await qb.getCount();

    if (count >= maxAllowed) {
      throw new BadRequestException(
        `Límite de inscripción excedido: El equipo ya cuenta con ${count} jugador(es) en la posición/demarcación "${demarcation.name}". El límite máximo permitido para este torneo es de ${maxAllowed}.`,
      );
    }
  }

  private async validateDuplicateAndJersey(
    playerId: string | number,
    teamRegistrationId: string | number,
    jerseyNumber?: number,
    currentRegistrationId?: string | number,
    runnerRepo?: Repository<PlayerRegistrationOrmEntity>,
  ) {
    if (!teamRegistrationId) return;
    const repository = runnerRepo || this.repo;

    // 1. Validar que el jugador no esté inscrito dos veces en el mismo equipo/edición
    if (playerId) {
      const qbPlayer = repository
        .createQueryBuilder('pr')
        .where('pr.teamRegistrationId = :teamRegistrationId', { teamRegistrationId })
        .andWhere('pr.playerId = :playerId', { playerId })
        .andWhere('pr.status != :finalizedStatus', { finalizedStatus: PlayerRegistrationStatus.FINALIZED_BY_TRANSFER });

      if (currentRegistrationId) {
        qbPlayer.andWhere('pr.id != :currentRegistrationId', { currentRegistrationId });
      }
      const existingPlayer = await qbPlayer.getOne();
      if (existingPlayer) {
        throw new BadRequestException('El jugador ya se encuentra inscrito en la nómina activa de este equipo para esta edición del torneo.');
      }
    }

    // 2. Validar dorsal único por equipo si se proporciona
    if (jerseyNumber !== undefined && jerseyNumber !== null && Number(jerseyNumber) > 0) {
      const qbJersey = repository
        .createQueryBuilder('pr')
        .where('pr.teamRegistrationId = :teamRegistrationId', { teamRegistrationId })
        .andWhere('pr.jerseyNumber = :jerseyNumber', { jerseyNumber })
        .andWhere('pr.status != :finalizedStatus', { finalizedStatus: PlayerRegistrationStatus.FINALIZED_BY_TRANSFER });

      if (currentRegistrationId) {
        qbJersey.andWhere('pr.id != :currentRegistrationId', { currentRegistrationId });
      }
      const existingJersey = await qbJersey.getOne();
      if (existingJersey) {
        throw new BadRequestException(`El número de dorsal #${jerseyNumber} ya está asignado a otro jugador activo en este equipo.`);
      }
    }
  }

  private async validateStageAndClassificationLimits(
    teamRegistrationId: string | number,
    playerClassificationId?: string | number,
    stageId?: string | number,
    currentRegistrationId?: string | number,
    runnerRepo?: Repository<PlayerRegistrationOrmEntity>,
  ) {
    if (!teamRegistrationId) return;

    const teamRegistration = await this.teamRegistrationRepo.findOne({
      where: { id: Number(teamRegistrationId) },
      relations: ['team', 'categoryEdition'],
    });

    if (!teamRegistration || !teamRegistration.categoryEditionId) return;

    // Validar configuración de torneo si existe
    const config = await this.transferConfigRepo.findOne({
      where: { editionId: teamRegistration.categoryEditionId },
    });
    if (config) {
      if (!config.inscriptionsEnabled) {
        throw new BadRequestException('El período de inscripciones se encuentra cerrado para este campeonato.');
      }
      const now = new Date();
      if (config.inscriptionsStartDate && new Date(config.inscriptionsStartDate) > now) {
        throw new BadRequestException(`Las inscripciones abrirán el ${new Date(config.inscriptionsStartDate).toLocaleDateString()}.`);
      }
      if (config.inscriptionsEndDate && new Date(config.inscriptionsEndDate) < now) {
        throw new BadRequestException(`El plazo de inscripciones finalizó el ${new Date(config.inscriptionsEndDate).toLocaleDateString()}.`);
      }
    }

    // Buscar el detalle de categoría correspondiente a la categoría específica de esta inscripción de equipo
    const categoryDetails = await this.editionCategoryDetailRepo.find({
      where: { editionId: teamRegistration.categoryEditionId },
      relations: ['classifications', 'classifications.playerClassification'],
    });

    if (!categoryDetails || categoryDetails.length === 0) return;
    const categoryDetail =
      (teamRegistration.categoryId
        ? categoryDetails.find((cd) => Number(cd.categoryId) === Number(teamRegistration.categoryId))
        : null) || categoryDetails[0];

    // 1. Validar límite máximo de jugadores inscritos por equipo
    const maxPlayers = categoryDetail.maxPlayers;
    const repository = runnerRepo || this.repo;

    if (maxPlayers && maxPlayers > 0) {
      const qbTotal = repository
        .createQueryBuilder('pr')
        .where('pr.teamRegistrationId = :teamRegistrationId', { teamRegistrationId })
        .andWhere('pr.status != :finalizedStatus', { finalizedStatus: PlayerRegistrationStatus.FINALIZED_BY_TRANSFER });

      if (currentRegistrationId) {
        qbTotal.andWhere('pr.id != :currentRegistrationId', { currentRegistrationId });
      }

      const totalCount = await qbTotal.getCount();
      if (totalCount >= maxPlayers) {
        throw new BadRequestException(
          `Límite de jugadores inscritos excedido: El equipo "${teamRegistration.team?.name || 'Club'}" ya ha alcanzado el límite máximo de ${maxPlayers} jugador(es) inscritos para la categoría "${categoryDetail.categoryDescription || 'Categoría'}".`,
        );
      }
    }

    // 2. Validar clasificaciones de futbolistas configuradas en el detalle de la categoría
    const classifications = categoryDetail.classifications || [];
    if (classifications.length > 0) {
      if (!playerClassificationId) {
        throw new BadRequestException(
          `La categoría "${categoryDetail.categoryDescription || 'Categoría'}" de la edición de torneo tiene clasificaciones de futbolistas configuradas. Es obligatorio asignar una clasificación al jugador.`,
        );
      }

      const classConfig = classifications.find(
        (c) => c.playerClassificationId === Number(playerClassificationId),
      );
      if (!classConfig) {
        throw new BadRequestException(
          `La clasificación de futbolista seleccionada no está habilitada para la categoría "${categoryDetail.categoryDescription || 'Categoría'}".`,
        );
      }

      const qbClass = repository
        .createQueryBuilder('pr')
        .where('pr.teamRegistrationId = :teamRegistrationId', { teamRegistrationId })
        .andWhere('pr.playerClassificationId = :playerClassificationId', { playerClassificationId })
        .andWhere('pr.status != :finalizedStatus', { finalizedStatus: PlayerRegistrationStatus.FINALIZED_BY_TRANSFER });

      if (currentRegistrationId) {
        qbClass.andWhere('pr.id != :currentRegistrationId', { currentRegistrationId });
      }

      const currentClassCount = await qbClass.getCount();
      if (currentClassCount >= classConfig.maxPlayers) {
        const desc = classConfig.playerClassification?.description || 'Seleccionada';
        throw new BadRequestException(
          `Cupo agotado para la clasificación "${desc}": El equipo "${teamRegistration.team?.name || 'Club'}" ya cuenta con ${currentClassCount} de los ${classConfig.maxPlayers} cupos permitidos en esta categoría.`,
        );
      }
    }
  }

  async list(companyId: number, query: { page?: number; limit?: number; search?: string; teamRegistrationId?: string; status?: string; playerId?: string | number; categoryEditionId?: string | number; categoryId?: string | number }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const qb = this.repo
      .createQueryBuilder('pr')
      .leftJoinAndSelect('pr.teamRegistration', 'teamRegistration')
      .leftJoinAndSelect('teamRegistration.team', 'team')
      .leftJoinAndSelect('pr.player', 'player')
      .leftJoinAndSelect('player.demarcation', 'demarcation')
      .leftJoinAndSelect('pr.playerClassification', 'playerClassification')
      .leftJoinAndSelect('pr.stage', 'stage');

    if (companyId) {
      qb.andWhere('(pr.companyId = :companyId OR pr.companyId IS NULL)', { companyId });
    }
    if (query.teamRegistrationId) {
      qb.andWhere('pr.teamRegistrationId = :teamRegistrationId', { teamRegistrationId: query.teamRegistrationId });
    }
    if (query.status) {
      qb.andWhere('pr.status = :status', { status: query.status });
    }
    if (query.playerId) {
      qb.andWhere('pr.playerId = :playerId', { playerId: Number(query.playerId) });
    }
    if (query.categoryEditionId) {
      qb.andWhere('teamRegistration.categoryEditionId = :categoryEditionId', { categoryEditionId: Number(query.categoryEditionId) });
    }
    if (query.categoryId) {
      qb.andWhere('teamRegistration.categoryId = :categoryId', { categoryId: Number(query.categoryId) });
    }
    if (query.search?.trim()) {
      qb.andWhere(
        '(LOWER(player.name) LIKE :term OR LOWER(player.lastName) LIKE :term OR LOWER(pr.carnetCode) LIKE :term OR LOWER(playerClassification.description) LIKE :term)',
        {
          term: `%${query.search.trim().toLowerCase()}%`,
        },
      );
    }

    qb.orderBy('pr.createdAt', 'DESC').skip(skip).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  /**
   * Listado agrupado de Inscripción y Carnets:
   * Una fila por cada (Equipo + Edición del Torneo) que haya sido registrado en Inscripción de Equipos.
   * Nivel 1 (Cabecera): Datos del Equipo y Edición del Torneo.
   * Nivel 2 (Detalle de Categorías): Categorías en las que ese equipo está permitido inscribir jugadores.
   * Nivel 3 (Detalle de Jugadores): Array de jugadores inscritos en cada categoría del equipo.
   */
  async listByTeamAndEdition(
    companyId: number,
    query: { page?: number; limit?: number; search?: string; categoryEditionId?: number; status?: string },
  ) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 10));

    const trQb = this.teamRegistrationRepo
      .createQueryBuilder('tr')
      .leftJoinAndSelect('tr.team', 'team')
      .leftJoinAndSelect('tr.categoryEdition', 'categoryEdition')
      .leftJoinAndSelect('tr.category', 'category');

    if (companyId) {
      trQb.andWhere('(tr.companyId = :companyId OR tr.companyId IS NULL)', { companyId });
    }
    if (query.categoryEditionId) {
      trQb.andWhere('tr.categoryEditionId = :edId', { edId: Number(query.categoryEditionId) });
    }
    if (query.search?.trim()) {
      const term = `%${query.search.trim().toLowerCase()}%`;
      trQb.andWhere(
        '(LOWER(team.name) LIKE :term OR LOWER(team.acronyms) LIKE :term OR LOWER(team.shortName) LIKE :term OR LOWER(categoryEdition.name) LIKE :term OR LOWER(category.name) LIKE :term)',
        { term },
      );
    }

    trQb.orderBy('tr.categoryEditionId', 'DESC').addOrderBy('team.name', 'ASC');
    const allTeamRegs = await trQb.getMany();

    // Agrupar por llave compuesta (categoryEditionId + teamId)
    const groupsMap = new Map<
      string,
      {
        categoryEditionId: number;
        teamId: number;
        team: any;
        categoryEdition: any;
        teamRegs: TeamRegistrationOrmEntity[];
      }
    >();

    for (const tr of allTeamRegs) {
      const key = `${tr.categoryEditionId}_${tr.teamId}`;
      if (!groupsMap.has(key)) {
        groupsMap.set(key, {
          categoryEditionId: Number(tr.categoryEditionId),
          teamId: Number(tr.teamId),
          team: tr.team,
          categoryEdition: tr.categoryEdition,
          teamRegs: [],
        });
      }
      groupsMap.get(key)!.teamRegs.push(tr);
    }

    const allGroups = Array.from(groupsMap.values());
    const total = allGroups.length;
    const pagedGroups = allGroups.slice((page - 1) * limit, page * limit);

    if (pagedGroups.length === 0) {
      return { data: [], total, page, limit, totalPages: Math.ceil(total / limit) || 1 };
    }

    const relevantTeamRegIds = pagedGroups.flatMap((g) => g.teamRegs.map((tr) => Number(tr.id)));
    const relevantEditionIds = Array.from(new Set(pagedGroups.map((g) => g.categoryEditionId)));

    // Consultar todos los jugadores inscritos en estos teamRegistrations
    const playerRegs = relevantTeamRegIds.length
      ? await this.repo
          .createQueryBuilder('pr')
          .leftJoinAndSelect('pr.player', 'player')
          .leftJoinAndSelect('player.demarcation', 'demarcation')
          .leftJoinAndSelect('pr.demarcation', 'registrationDemarcation')
          .leftJoinAndSelect('pr.playerClassification', 'playerClassification')
          .where('pr.teamRegistrationId IN (:...trIds)', { trIds: relevantTeamRegIds })
          .andWhere('pr.status != :finalizedStatus', {
            finalizedStatus: PlayerRegistrationStatus.FINALIZED_BY_TRANSFER,
          })
          .orderBy('pr.jerseyNumber', 'ASC')
          .getMany()
      : [];

    // Consultar detalles de categorías de las ediciones involucradas (cupos y clasificaciones permitidas)
    const editionDetails = relevantEditionIds.length
      ? await this.editionCategoryDetailRepo
          .createQueryBuilder('ecd')
          .leftJoinAndSelect('ecd.category', 'category')
          .leftJoinAndSelect('ecd.classifications', 'classifications')
          .leftJoinAndSelect('classifications.playerClassification', 'playerClassification')
          .where('ecd.editionId IN (:...edIds)', { edIds: relevantEditionIds })
          .getMany()
      : [];

    const data = pagedGroups.map((grp) => {
      const edDetailsForEdition = editionDetails.filter(
        (ed) => Number(ed.editionId) === Number(grp.categoryEditionId),
      );
      const firstDetail = edDetailsForEdition[0] || null;

      const categories = grp.teamRegs.map((tr) => {
        const matchedDetail =
          (tr.categoryId
            ? edDetailsForEdition.find((ed) => Number(ed.categoryId) === Number(tr.categoryId))
            : null) || firstDetail;

        const categoryId = Number(tr.categoryId || matchedDetail?.categoryId || 0);
        const categoryName =
          tr.category?.name ||
          matchedDetail?.categoryDescription ||
          matchedDetail?.category?.name ||
          'Categoría';
        const categoryAcronyms =
          tr.category?.acronyms || matchedDetail?.category?.acronyms || '';
        const gender = tr.category?.gender || matchedDetail?.category?.gender || 'MALE';
        const maxPlayers = Number(matchedDetail?.maxPlayers) || 25;

        const allowedClassifications = (matchedDetail?.classifications || []).map((c) => ({
          playerClassificationId: Number(c.playerClassificationId),
          description: c.playerClassification?.description || 'Clasificación',
          code: c.playerClassification?.code || '',
          maxPlayers: Number(c.maxPlayers) || 0,
          maxInactivityMonths: c.maxInactivityMonths ?? null,
          maxMonths: c.maxMonths ?? null,
        }));

        const playersForCat = playerRegs
          .filter((pr) => Number(pr.teamRegistrationId) === Number(tr.id))
          .map((pr) => ({
            id: pr.id,
            teamRegistrationId: pr.teamRegistrationId,
            playerId: pr.playerId,
            playerName: `${pr.player?.name || ''} ${pr.player?.lastName || ''}`.trim(),
            firstName: pr.player?.name || '',
            lastName: pr.player?.lastName || '',
            identification: pr.player?.identification || '',
            photo: pr.player?.photo || '',
            demarcationId: pr.demarcationId ?? pr.player?.demarcationId ?? null,
            demarcationName: pr.demarcation?.name || pr.player?.demarcation?.name || '',
            carnetCode: pr.player?.code || pr.carnetCode || '',
            playerClassificationId: pr.playerClassificationId || pr.player?.playerClassificationId || null,
            playerClassificationName: pr.playerClassification?.description || '',
            jerseyNumber: pr.jerseyNumber,
            isCaptain: Boolean(pr.isCaptain),
            status: pr.status,
          }));

        return {
          teamRegistrationId: Number(tr.id),
          categoryId,
          categoryName,
          categoryAcronyms,
          gender,
          maxPlayers,
          registrationStatus: tr.status,
          paymentStatus: tr.paymentStatus,
          allowedClassifications,
          playersCount: playersForCat.length,
          players: playersForCat,
        };
      });

      const allPlayers = categories.flatMap((c) =>
        c.players.map((p) => ({
          ...p,
          categoryId: c.categoryId,
          categoryName: c.categoryName,
        })),
      );

      return {
        id: `${grp.categoryEditionId}_${grp.teamId}`,
        categoryEditionId: grp.categoryEditionId,
        teamId: grp.teamId,
        team: {
          id: grp.team?.id || grp.teamId,
          name: grp.team?.name || `Equipo #${grp.teamId}`,
          shortName: grp.team?.shortName || '',
          acronyms: grp.team?.acronyms || '',
          logo: grp.team?.logo || '',
          color1: grp.team?.color1 || '',
          color2: grp.team?.color2 || '',
        },
        categoryEdition: {
          id: grp.categoryEdition?.id || grp.categoryEditionId,
          name: grp.categoryEdition?.name || `Edición #${grp.categoryEditionId}`,
        },
        categoriesCount: categories.length,
        playersCount: allPlayers.length,
        categories,
        players: allPlayers,
      };
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  /**
   * Sincroniza la plantilla de jugadores por cada categoría permitida de un equipo en una edición
   */
  async syncTeamEditionRoster(dto: SyncTeamEditionRosterDto, user: any, companyId: number) {
    const editionId = Number(dto.categoryEditionId);
    const teamId = Number(dto.teamId);

    const groups = dto.categories || [];
    const trIds = groups.map((c) => Number(c.teamRegistrationId)).filter(Boolean);
    if (trIds.length === 0) {
      throw new BadRequestException('El equipo no tiene categorías válidas para sincronizar su plantilla.');
    }
    if (new Set(trIds).size !== trIds.length) {
      throw new BadRequestException('Una misma categoría viene repetida en la plantilla.');
    }

    const teamRegs = await this.teamRegistrationRepo.find({
      where: trIds.map((id) => ({ id, companyId })),
      relations: ['team', 'category', 'categoryEdition'],
    });

    if (teamRegs.length === 0) {
      throw new NotFoundException('No se encontraron las inscripciones de categoría para este equipo.');
    }

    // Cada inscripción enviada debe ser de la empresa activa y del equipo y la edición indicados:
    // fuera de ellas no se lee, no se escribe y no se borra nada.
    for (const trId of trIds) {
      const tr = teamRegs.find((r) => Number(r.id) === trId);
      if (!tr) throw new NotFoundException(`Inscripción de equipo no encontrada (#${trId}).`);
      if (Number(tr.teamId) !== teamId || Number(tr.categoryEditionId) !== editionId) {
        throw new BadRequestException(`La inscripción #${trId} no pertenece al equipo y la edición indicados.`);
      }
    }

    // Obtener detalles de categorías de la edición para validar cupos por categoría y clasificaciones
    const editionDetails = await this.editionCategoryDetailRepo.find({
      where: { editionId },
      relations: ['classifications', 'classifications.playerClassification'],
    });

    // Determinar estado inicial si hay configuración de torneo
    let defaultInitialStatus = PlayerRegistrationStatus.ELIGIBLE;
    const config = await this.transferConfigRepo.findOne({ where: { editionId } });
    if (config?.inscriptionsRequireApproval) {
      defaultInitialStatus = PlayerRegistrationStatus.PENDING_APPROVAL;
    }

    // Recolectar todos los playerIds para cargar sus códigos de ficha oficial
    const allIncomingPlayerIds = Array.from(new Set(groups.flatMap((cg) => (cg.players || []).map((p) => Number(p.playerId)).filter(Boolean))));

    for (const pId of allIncomingPlayerIds) {
      await assertPlayerInCompany(this.repo.manager, pId, companyId);
    }

    const playerEntities = allIncomingPlayerIds.length
      ? await this.playerRepo.find({
          where: allIncomingPlayerIds.map((id) => ({ id })),
          relations: ['demarcation'],
        })
      : [];
    const playerById = new Map(playerEntities.map((p) => [Number(p.id), p]));

    // Demarcación efectiva de cada jugador entrante: la elegida en la plantilla o, si no, la del jugador
    const effectiveDemarcationId = (p: { playerId: number; demarcationId?: number }): number | null => {
      if (p.demarcationId) return Number(p.demarcationId);
      const pl = playerById.get(Number(p.playerId));
      return pl?.demarcationId ? Number(pl.demarcationId) : null;
    };
    const demarcationIds = Array.from(new Set(groups.flatMap((cg) => (cg.players || []).filter((p) => Boolean(p.playerId)).map((p) => effectiveDemarcationId(p)).filter((id): id is number => Boolean(id)))));
    const demarcations = demarcationIds.length
      ? await this.repo.manager.getRepository(DemarcationOrmEntity).find({
          where: demarcationIds.flatMap((id) => [{ id, companyId }, { id, companyId: IsNull() }]),
        })
      : [];
    const demarcationById = new Map(demarcations.map((d) => [Number(d.id), d]));

    // Inscripciones de jugadores que ya existen en estas categorías (una sola consulta)
    const existingAll = await this.repo.find({ where: trIds.map((id) => ({ teamRegistrationId: id })) });
    const existingByTr = new Map<number, PlayerRegistrationOrmEntity[]>();
    for (const ex of existingAll) {
      existingByTr.set(Number(ex.teamRegistrationId), [...(existingByTr.get(Number(ex.teamRegistrationId)) ?? []), ex]);
    }

    // Plazo de inscripciones: solo bloquea agregar jugadores (o reincorporar a uno transferido); editar dorsales o clasificaciones de los ya inscritos sigue permitido
    const addsPlayers = groups.some((cg) =>
      (cg.players || [])
        .filter((p) => Boolean(p.playerId))
        .some((p) => {
          const ex = (existingByTr.get(Number(cg.teamRegistrationId)) ?? []).find((e) => Number(e.playerId) === Number(p.playerId));
          return !ex || ex.status === PlayerRegistrationStatus.FINALIZED_BY_TRANSFER;
        }),
    );
    if (config && addsPlayers) {
      if (!config.inscriptionsEnabled) {
        throw new BadRequestException('El período de inscripciones se encuentra cerrado para este campeonato.');
      }
      const now = new Date();
      if (config.inscriptionsStartDate && new Date(config.inscriptionsStartDate) > now) {
        throw new BadRequestException(`Las inscripciones abrirán el ${new Date(config.inscriptionsStartDate).toLocaleDateString()}.`);
      }
      if (config.inscriptionsEndDate && new Date(config.inscriptionsEndDate) < now) {
        throw new BadRequestException(`El plazo de inscripciones finalizó el ${new Date(config.inscriptionsEndDate).toLocaleDateString()}.`);
      }
    }

    const userId = user?.user_id?.toString() || user?.id?.toString();
    const userName = user?.user_name || user?.name;

    // Validar reglas por cada categoría antes de persistir
    for (const catGroup of groups) {
      const trId = Number(catGroup.teamRegistrationId);
      const tr = teamRegs.find((r) => Number(r.id) === trId)!;

      const catDetail = (tr.categoryId ? editionDetails.find((ed) => Number(ed.categoryId) === Number(tr.categoryId)) : null) || editionDetails[0];
      const catLabel = tr.category?.name || catDetail?.categoryDescription || 'Categoría';
      const maxPlayers = Number(catDetail?.maxPlayers) || 25;

      const incomingPlayers = (catGroup.players || []).filter((p) => Boolean(p.playerId));
      if (incomingPlayers.length > maxPlayers) {
        throw new BadRequestException(`La categoría "${catLabel}" permite un máximo de ${maxPlayers} jugadores inscritos (intentaste registrar ${incomingPlayers.length}).`);
      }

      const seenPlayersInCat = new Set<number>();
      const seenJerseysInCat = new Set<number>();
      const classCounts = new Map<number, number>();
      const demarcationCounts = new Map<number, number>();

      for (const p of incomingPlayers) {
        const pId = Number(p.playerId);
        const jersey = Number(p.jerseyNumber);
        const pl = playerById.get(pId);
        const playerLabel = pl ? pl.name + ' ' + pl.lastName : '#' + pId;

        if (!jersey || jersey <= 0) {
          throw new BadRequestException(`Debe asignar un número de dorsal válido al jugador "${playerLabel}" en la categoría "${catLabel}".`);
        }
        if (seenPlayersInCat.has(pId)) {
          throw new BadRequestException(`El jugador "${playerLabel}" está repetido en la categoría "${catLabel}".`);
        }
        seenPlayersInCat.add(pId);

        if (seenJerseysInCat.has(jersey)) {
          throw new BadRequestException(`El número de dorsal #${jersey} está repetido en la categoría "${catLabel}".`);
        }
        seenJerseysInCat.add(jersey);

        if (p.playerClassificationId) {
          const cId = Number(p.playerClassificationId);
          classCounts.set(cId, (classCounts.get(cId) || 0) + 1);
        } else if (catDetail?.classifications && catDetail.classifications.length > 0) {
          throw new BadRequestException(`Debe seleccionar la clasificación para el jugador "${playerLabel}" en la categoría "${catLabel}".`);
        }

        // Demarcación / posición en campo: debe existir y cuenta para el límite de la demarcación
        const demId = effectiveDemarcationId(p);
        if (p.demarcationId && !demarcationById.has(Number(p.demarcationId))) {
          throw new BadRequestException(`La demarcación elegida para el jugador "${playerLabel}" no existe.`);
        }
        if (demId) demarcationCounts.set(demId, (demarcationCounts.get(demId) || 0) + 1);
      }

      // Validar cupos por clasificación si la categoría tiene clasificaciones configuradas
      if (catDetail?.classifications && catDetail.classifications.length > 0) {
        for (const [cId, count] of classCounts.entries()) {
          const cfg = catDetail.classifications.find((c) => Number(c.playerClassificationId) === cId);
          if (cfg && cfg.maxPlayers > 0 && count > cfg.maxPlayers) {
            const desc = cfg.playerClassification?.description || 'Clasificación';
            throw new BadRequestException(`Cupo excedido para "${desc}" en la categoría "${catLabel}": máximo permitido ${cfg.maxPlayers}, seleccionados ${count}.`);
          }
        }
      }

      // Límite de jugadores por demarcación (el mismo que aplican la inscripción individual y la masiva)
      for (const [demId, count] of demarcationCounts.entries()) {
        const dem = demarcationById.get(demId);
        const max = Number(dem?.maxPlayers);
        if (dem && max > 0 && count > max) {
          throw new BadRequestException(`Límite de inscripción excedido en la categoría "${catLabel}": la posición/demarcación "${dem.name}" permite un máximo de ${max} jugador(es) y seleccionaste ${count}.`);
        }
      }
    }

    // Persistir cambios de todas las categorías en una sola transacción: o se guarda toda la plantilla o nada
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let totalSaved = 0;
    try {
      const runnerRepo = queryRunner.manager.getRepository(PlayerRegistrationOrmEntity);
      const historyRunnerRepo = queryRunner.manager.getRepository(PlayerRegistrationHistoryOrmEntity);

      for (const catGroup of groups) {
        const trId = Number(catGroup.teamRegistrationId);
        const existingRegs = existingByTr.get(trId) ?? [];

        const existingByPlayerId = new Map<number, PlayerRegistrationOrmEntity>();
        for (const ex of existingRegs) {
          existingByPlayerId.set(Number(ex.playerId), ex);
        }

        const incomingPlayers = (catGroup.players || []).filter((p) => Boolean(p.playerId));
        const incomingPlayerIdsSet = new Set(incomingPlayers.map((p) => Number(p.playerId)));

        // Eliminar los que fueron quitados de la tabla
        const toRemove = existingRegs.filter((ex) => !incomingPlayerIdsSet.has(Number(ex.playerId)) && ex.status !== PlayerRegistrationStatus.FINALIZED_BY_TRANSFER);
        if (toRemove.length > 0) {
          await runnerRepo.remove(toRemove);
        }

        for (const inc of incomingPlayers) {
          const pId = Number(inc.playerId);
          const plEntity = playerById.get(pId);
          const officialCode = plEntity?.code || inc.carnetCode || `JUG-${String(pId).padStart(5, '0')}`;
          const classificationId = inc.playerClassificationId ? Number(inc.playerClassificationId) : (plEntity?.playerClassificationId ?? null);
          const demarcationId = effectiveDemarcationId(inc);
          const prev = existingByPlayerId.get(pId);

          if (prev) {
            // Un jugador transferido que vuelve a este equipo se reincorpora (la inscripción es única por jugador y equipo)
            const previousStatus = prev.status;
            const reactivated = previousStatus === PlayerRegistrationStatus.FINALIZED_BY_TRANSFER;

            prev.jerseyNumber = Number(inc.jerseyNumber);
            prev.carnetCode = officialCode;
            prev.playerClassificationId = classificationId;
            prev.demarcationId = demarcationId;
            prev.isCaptain = Boolean(inc.isCaptain);
            if (reactivated) prev.status = defaultInitialStatus;
            prev.updatedBy = userId;
            prev.updateName = userName;
            await runnerRepo.save(prev);
            totalSaved++;

            if (reactivated) {
              await historyRunnerRepo.save({
                companyId,
                playerRegistrationId: prev.id,
                playerId: prev.playerId,
                action: PlayerRegistrationHistoryAction.REACTIVATED,
                previousStatus,
                newStatus: prev.status,
                performedById: resolveUserId(user),
                performedByName: userName,
                comments: 'Jugador reincorporado al equipo desde Configuración de Plantilla por Categoría',
                metadata: { jerseyNumber: prev.jerseyNumber, teamRegistrationId: trId },
              });
            }
          } else {
            const created = await runnerRepo.save(
              runnerRepo.create({
                companyId,
                teamRegistrationId: trId,
                playerId: pId,
                jerseyNumber: Number(inc.jerseyNumber),
                carnetCode: officialCode,
                playerClassificationId: classificationId,
                demarcationId,
                isCaptain: Boolean(inc.isCaptain),
                status: defaultInitialStatus,
                createdBy: userId,
                createdName: userName,
              }),
            );
            totalSaved++;

            await historyRunnerRepo.save({
              companyId,
              playerRegistrationId: created.id,
              playerId: created.playerId,
              action: PlayerRegistrationHistoryAction.CREATED,
              newStatus: created.status,
              performedById: resolveUserId(user),
              performedByName: userName,
              comments: 'Inscripción registrada desde Configuración de Plantilla por Categoría',
              metadata: { jerseyNumber: created.jerseyNumber, teamRegistrationId: trId },
            });
          }
        }
      }

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }

    return {
      categoryEditionId: editionId,
      teamId,
      totalSaved,
      message: 'Plantilla y carnets del equipo guardados exitosamente.',
    };
  }

  async get(id: string | number, companyId: number, write = false) {
    const item = await this.repo.findOne({
      where: { id: Number(id) },
      relations: [
        'teamRegistration',
        'teamRegistration.team',
        'player',
        'player.demarcation',
        'playerClassification',
        'stage',
      ],
    });
    return ensureCompanyScope(item, companyId, 'Inscripción de jugador no encontrada', write);
  }

  async create(dto: CreatePlayerRegistrationDto, user: any, companyId: number) {
    await this.assertReferences(companyId, {
      teamRegistrationId: dto.teamRegistrationId,
      stageId: dto.stageId,
      playerIds: [dto.playerId],
    });

    if (dto.playerId && dto.teamRegistrationId) {
      await this.validateDemarcationLimit(dto.playerId, dto.teamRegistrationId, undefined, undefined, dto.demarcationId);
      await this.validateDuplicateAndJersey(dto.playerId, dto.teamRegistrationId, dto.jerseyNumber);
      await this.validateStageAndClassificationLimits(
        dto.teamRegistrationId,
        dto.playerClassificationId,
        dto.stageId,
      );
    }

    // Determinar estado inicial según configuración de torneo
    let initialStatus = dto.status || PlayerRegistrationStatus.ELIGIBLE;
    const teamReg = await this.teamRegistrationRepo.findOne({
      where: { id: Number(dto.teamRegistrationId) },
    });
    if (teamReg?.categoryEditionId) {
      const config = await this.transferConfigRepo.findOne({
        where: { editionId: teamReg.categoryEditionId },
      });
      if (config?.inscriptionsRequireApproval && !dto.status) {
        initialStatus = PlayerRegistrationStatus.PENDING_APPROVAL;
      }
    }

    const playerEntity = await this.playerRepo.findOne({ where: { id: Number(dto.playerId) } });
    const officialCarnetCode = playerEntity?.code || dto.carnetCode || undefined;

    const item = this.repo.create({
      ...dto,
      carnetCode: officialCarnetCode,
      // Sin demarcación elegida, queda la del jugador
      demarcationId: dto.demarcationId ?? playerEntity?.demarcationId ?? undefined,
      status: initialStatus,
      registrationDate: dto.registrationDate ? new Date(dto.registrationDate) : undefined,
      companyId,
      createdBy: user?.user_id?.toString() || user?.id?.toString(),
      createdName: user?.user_name || user?.name,
    });
    const saved = await this.repo.save(item);

    // Registrar historial de auditoría
    await this.historyRepo.save({
      companyId,
      playerRegistrationId: saved.id,
      playerId: saved.playerId,
      action: PlayerRegistrationHistoryAction.CREATED,
      newStatus: saved.status,
      performedById: resolveUserId(user),
      performedByName: user?.user_name || user?.name,
      comments: 'Inscripción individual registrada',
      metadata: { jerseyNumber: saved.jerseyNumber, teamRegistrationId: saved.teamRegistrationId },
    });

    return saved;
  }

  /**
   * Inscripción Masiva Atómica mediante Transacción
   */
  async createMass(dto: MassPlayerRegistrationDto, user: any, companyId: number) {
    if (!dto.registrations || dto.registrations.length === 0) {
      throw new BadRequestException('Debe incluir al menos un jugador para la inscripción masiva');
    }

    await this.assertReferences(companyId, {
      teamRegistrationId: dto.teamRegistrationId,
      stageId: dto.stageId,
      playerIds: dto.registrations.map((r) => r.playerId),
    });

    const teamRegistration = await this.teamRegistrationRepo.findOne({
      where: { id: Number(dto.teamRegistrationId) },
      relations: ['team', 'categoryEdition'],
    });
    if (!teamRegistration) {
      throw new NotFoundException('Inscripción de equipo no encontrada');
    }

    // Validar configuración de torneo
    if (teamRegistration.categoryEditionId) {
      const config = await this.transferConfigRepo.findOne({
        where: { editionId: teamRegistration.categoryEditionId },
      });
      if (config) {
        if (!config.inscriptionsEnabled) {
          throw new BadRequestException('El período de inscripciones se encuentra cerrado.');
        }
        if (!config.allowMassInscription) {
          throw new BadRequestException('La inscripción masiva está deshabilitada para este campeonato.');
        }
      }
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const createdRecords: PlayerRegistrationOrmEntity[] = [];

    try {
      const runnerRepo = queryRunner.manager.getRepository(PlayerRegistrationOrmEntity);
      const historyRunnerRepo = queryRunner.manager.getRepository(PlayerRegistrationHistoryOrmEntity);

      // Determinar si requiere aprobación
      let initialStatus = PlayerRegistrationStatus.ELIGIBLE;
      if (teamRegistration.categoryEditionId) {
        const config = await this.transferConfigRepo.findOne({
          where: { editionId: teamRegistration.categoryEditionId },
        });
        if (config?.inscriptionsRequireApproval) {
          initialStatus = PlayerRegistrationStatus.PENDING_APPROVAL;
        }
      }

      for (const reg of dto.registrations) {
        await this.validateDemarcationLimit(reg.playerId, dto.teamRegistrationId, undefined, runnerRepo, reg.demarcationId);
        await this.validateDuplicateAndJersey(reg.playerId, dto.teamRegistrationId, reg.jerseyNumber, undefined, runnerRepo);
        await this.validateStageAndClassificationLimits(
          dto.teamRegistrationId,
          reg.playerClassificationId,
          dto.stageId,
          undefined,
          runnerRepo,
        );

        const record = runnerRepo.create({
          teamRegistrationId: dto.teamRegistrationId,
          stageId: dto.stageId,
          playerId: reg.playerId,
          jerseyNumber: reg.jerseyNumber,
          carnetCode: reg.carnetCode,
          playerClassificationId: reg.playerClassificationId,
          demarcationId: reg.demarcationId,
          isCaptain: Boolean(reg.isCaptain),
          documents: reg.documents || [],
          status: initialStatus,
          companyId,
          createdBy: user?.user_id?.toString() || user?.id?.toString(),
          createdName: user?.user_name || user?.name,
        });

        const saved = await runnerRepo.save(record);
        createdRecords.push(saved);

        await historyRunnerRepo.save({
          companyId: saved.companyId,
          playerRegistrationId: saved.id,
          playerId: saved.playerId,
          action: PlayerRegistrationHistoryAction.MASS_CREATED,
          newStatus: saved.status,
          performedById: resolveUserId(user),
          performedByName: user?.user_name || user?.name,
          comments: 'Inscripción procesada mediante carga masiva',
          metadata: { jerseyNumber: saved.jerseyNumber, teamRegistrationId: dto.teamRegistrationId },
        });
      }

      await queryRunner.commitTransaction();
      return {
        message: `Se han inscrito exitosamente ${createdRecords.length} jugador(es) en la nómina oficial.`,
        count: createdRecords.length,
        data: createdRecords,
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async update(id: string | number, dto: UpdatePlayerRegistrationDto, user: any, companyId: number) {
    const item = await this.get(id, companyId, true);
    await this.assertReferences(companyId, {
      teamRegistrationId: dto.teamRegistrationId,
      stageId: dto.stageId,
      playerIds: dto.playerId ? [dto.playerId] : [],
    });

    const targetPlayerId = dto.playerId || item.playerId;
    const targetTeamRegId = dto.teamRegistrationId || item.teamRegistrationId;
    const targetClassificationId =
      dto.playerClassificationId !== undefined ? dto.playerClassificationId : item.playerClassificationId;
    const targetStageId = dto.stageId !== undefined ? dto.stageId : item.stageId;

    if (targetPlayerId && targetTeamRegId) {
      await this.validateDemarcationLimit(targetPlayerId, targetTeamRegId, id, undefined, dto.demarcationId !== undefined ? dto.demarcationId : item.demarcationId);
      const targetJersey = dto.jerseyNumber !== undefined ? dto.jerseyNumber : item.jerseyNumber;
      await this.validateDuplicateAndJersey(targetPlayerId, targetTeamRegId, targetJersey, id);
      await this.validateStageAndClassificationLimits(
        targetTeamRegId,
        targetClassificationId,
        targetStageId,
        id,
      );
    }

    const previousStatus = item.status;
    Object.assign(item, dto, {
      registrationDate: dto.registrationDate ? new Date(dto.registrationDate) : item.registrationDate,
      updatedBy: user?.user_id?.toString() || user?.id?.toString(),
      updateName: user?.user_name || user?.name,
    });
    const saved = await this.repo.save(item);

    if (dto.status && dto.status !== previousStatus) {
      await this.historyRepo.save({
        companyId: saved.companyId,
        playerRegistrationId: saved.id,
        playerId: saved.playerId,
        action: PlayerRegistrationHistoryAction.STATUS_CHANGE,
        previousStatus,
        newStatus: saved.status,
        performedById: resolveUserId(user),
        performedByName: user?.user_name || user?.name,
        comments: 'Estado modificado en edición de registro',
      });
    }

    return saved;
  }

  /**
   * Transición de estados de inscripción con trazabilidad y auditoría
   */
  async updateStatus(id: string, dto: UpdatePlayerRegistrationStatusDto, user: any, companyId: number) {
    const item = await this.get(id, companyId, true);
    const previousStatus = item.status;

    item.status = dto.status;
    item.updatedBy = user?.user_id?.toString() || user?.id?.toString();
    item.updateName = user?.user_name || user?.name;
    const saved = await this.repo.save(item);

    let action = PlayerRegistrationHistoryAction.STATUS_CHANGE;
    if (dto.status === PlayerRegistrationStatus.ELIGIBLE && previousStatus === PlayerRegistrationStatus.PENDING_APPROVAL) {
      action = PlayerRegistrationHistoryAction.APPROVED;
    } else if (dto.status === PlayerRegistrationStatus.SUSPENDED) {
      action = PlayerRegistrationHistoryAction.SUSPENDED;
    } else if (dto.status === PlayerRegistrationStatus.ELIGIBLE && previousStatus === PlayerRegistrationStatus.SUSPENDED) {
      action = PlayerRegistrationHistoryAction.REACTIVATED;
    } else if (dto.status === PlayerRegistrationStatus.INELIGIBLE) {
      action = PlayerRegistrationHistoryAction.REJECTED;
    }

    await this.historyRepo.save({
      companyId: saved.companyId,
      playerRegistrationId: saved.id,
      playerId: saved.playerId,
      action,
      previousStatus,
      newStatus: saved.status,
      performedById: resolveUserId(user),
      performedByName: user?.user_name || user?.name,
      comments: dto.comments || `Cambio de estado a ${dto.status}`,
    });

    return saved;
  }

  /**
   * Obtiene la plantilla completa y el balance de cupos ocupados vs disponibles
   */
  async getRosterByTeamRegistration(teamRegistrationId: string | number, companyId: number) {
    const numTeamRegId = Number(teamRegistrationId);
    const teamReg = await this.teamRegistrationRepo.findOne({
      where: { id: numTeamRegId },
      relations: ['team', 'categoryEdition', 'categoryEdition.category'],
    });
    ensureCompanyScope(teamReg, companyId, 'Inscripción de equipo no encontrada');

    const registrations = await this.repo.find({
      where: { teamRegistrationId: numTeamRegId },
      relations: ['player', 'player.demarcation', 'demarcation', 'playerClassification', 'stage'],
      order: { jerseyNumber: 'ASC' },
    });

    // Cupos y clasificaciones configuradas en la edición de torneo
    const categoryDetails = await this.editionCategoryDetailRepo.find({
      where: { editionId: teamReg.categoryEditionId },
      relations: ['classifications', 'classifications.playerClassification'],
    });

    const categoryDetail = categoryDetails[0] || null;
    const maxGeneralPlayers = categoryDetail ? Number(categoryDetail.maxPlayers) || 25 : 25;
    const activeRegistrations = registrations.filter(
      (r) => r.status !== PlayerRegistrationStatus.FINALIZED_BY_TRANSFER,
    );

    const classificationStats = (categoryDetail?.classifications || []).map((c) => {
      const current = activeRegistrations.filter((r) => r.playerClassificationId === c.playerClassificationId).length;
      const max = Number(c.maxPlayers) || 0;
      return {
        playerClassificationId: c.playerClassificationId,
        description: c.playerClassification?.description || 'Clasificación',
        code: c.playerClassification?.code,
        maxAllowed: max,
        currentCount: current,
        available: Math.max(0, max - current),
      };
    });

    return {
      teamRegistration: teamReg,
      totalActive: activeRegistrations.length,
      maxGeneralPlayers,
      availableGeneralSlots: Math.max(0, maxGeneralPlayers - activeRegistrations.length),
      classificationStats,
      players: registrations,
    };
  }

  async remove(id: string | number, companyId: number) {
    const item = await this.get(id, companyId, true);
    return this.repo.remove(item);
  }
}
