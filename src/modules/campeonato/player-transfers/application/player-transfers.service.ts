import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { PlayerTransferOrmEntity } from '../../infrastructure/persistence/player-transfer.orm-entity';
import { PlayerTransferApprovalOrmEntity } from '../../infrastructure/persistence/player-transfer-approval.orm-entity';
import { PlayerOrmEntity } from '../../infrastructure/persistence/player.orm-entity';
import { TeamOrmEntity } from '../../infrastructure/persistence/team.orm-entity';
import { TeamRegistrationOrmEntity } from '../../infrastructure/persistence/team-registration.orm-entity';
import { PlayerRegistrationOrmEntity } from '../../infrastructure/persistence/player-registration.orm-entity';
import { TournamentTransferConfigOrmEntity } from '../../infrastructure/persistence/tournament-transfer-config.orm-entity';
import { PlayerRegistrationHistoryOrmEntity } from '../../infrastructure/persistence/player-registration-history.orm-entity';
import { EditionCategoryDetailOrmEntity } from '../../infrastructure/persistence/edition-category-detail.orm-entity';
import { CategoryEditionOrmEntity } from '../../infrastructure/persistence/category-edition.orm-entity';
import { StageOrmEntity } from '../../infrastructure/persistence/stage.orm-entity';
import { assertBelongsToCompany, assertPlayerInCompany, ensureCompanyScope, resolveUserId } from '../../common/company-scope.util';
import {
  TransferStatus,
  TransferApprovalRole,
  TransferApprovalStatus,
  PlayerRegistrationStatus,
  PlayerRegistrationHistoryAction,
} from '../../common/enum/campeonato.enum';
import {
  CreatePlayerTransferDto,
  ApproveTransferDto,
  FilterTransferQueryDto,
} from './dto/player-transfer.dto';

@Injectable()
export class PlayerTransfersService {
  constructor(
    @InjectRepository(PlayerTransferOrmEntity)
    private readonly repo: Repository<PlayerTransferOrmEntity>,
    @InjectRepository(PlayerTransferApprovalOrmEntity)
    private readonly approvalRepo: Repository<PlayerTransferApprovalOrmEntity>,
    @InjectRepository(PlayerOrmEntity)
    private readonly playerRepo: Repository<PlayerOrmEntity>,
    @InjectRepository(TeamOrmEntity)
    private readonly teamRepo: Repository<TeamOrmEntity>,
    @InjectRepository(TeamRegistrationOrmEntity)
    private readonly teamRegistrationRepo: Repository<TeamRegistrationOrmEntity>,
    @InjectRepository(PlayerRegistrationOrmEntity)
    private readonly playerRegistrationRepo: Repository<PlayerRegistrationOrmEntity>,
    @InjectRepository(TournamentTransferConfigOrmEntity)
    private readonly transferConfigRepo: Repository<TournamentTransferConfigOrmEntity>,
    @InjectRepository(PlayerRegistrationHistoryOrmEntity)
    private readonly historyRepo: Repository<PlayerRegistrationHistoryOrmEntity>,
    @InjectRepository(EditionCategoryDetailOrmEntity)
    private readonly editionCategoryDetailRepo: Repository<EditionCategoryDetailOrmEntity>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Crear la orden de transferencia (queda pendiente de firmas) con detección automática del equipo de origen
   */
  async createRequest(dto: CreatePlayerTransferDto, user: any, companyId: number) {
    const player = await this.playerRepo.findOne({ where: { id: dto.playerId } });
    if (!player) throw new NotFoundException('Jugador no encontrado en el sistema');

    // 0. Los ids del body deben pertenecer a la empresa activa
    await assertPlayerInCompany(this.repo.manager, dto.playerId, companyId);
    await assertBelongsToCompany(this.repo.manager.getRepository(CategoryEditionOrmEntity), dto.editionId, companyId, 'Edición de torneo no encontrada');
    await assertBelongsToCompany(this.teamRepo, dto.destinationTeamId, companyId, 'Equipo de destino no encontrado');
    await assertBelongsToCompany(this.teamRepo, dto.passOwnerTeamId, companyId, 'Equipo dueño del pase no encontrado');
    await assertBelongsToCompany(this.repo.manager.getRepository(StageOrmEntity), dto.stageId, companyId, 'Etapa no encontrada');

    // 1. La categoría debe ser una de las categorías de la edición
    if (dto.categoryId) {
      const editionCategory = await this.editionCategoryDetailRepo.findOne({ where: { editionId: Number(dto.editionId), categoryId: Number(dto.categoryId) } });
      if (!editionCategory) throw new BadRequestException('La categoría seleccionada no pertenece a la edición del campeonato.');
    }

    // 2. Inscripción vigente del jugador (su club de origen) en la edición y, si se indica, en la categoría
    const activeRegistrationQuery = this.playerRegistrationRepo
      .createQueryBuilder('pr')
      .leftJoinAndSelect('pr.teamRegistration', 'tr')
      .leftJoinAndSelect('tr.team', 'team')
      .where('pr.playerId = :playerId', { playerId: dto.playerId })
      .andWhere('tr.categoryEditionId = :editionId', { editionId: dto.editionId })
      .andWhere('(pr.companyId = :companyId OR pr.companyId IS NULL)', { companyId })
      .andWhere('pr.status != :finalizedStatus', { finalizedStatus: PlayerRegistrationStatus.FINALIZED_BY_TRANSFER });
    if (dto.categoryId) activeRegistrationQuery.andWhere('tr.categoryId = :categoryId', { categoryId: Number(dto.categoryId) });
    const activeRegistration = await activeRegistrationQuery.getOne();

    // Sin categoría (modal de jugadores) el jugador debe estar inscrito; con categoría (orden de transferencia) puede no tener club en ella.
    if (!activeRegistration && !dto.categoryId) {
      throw new BadRequestException(
        `El jugador ${player.name} ${player.lastName} no cuenta con una inscripción vigente en ningún equipo de este campeonato. Para incorporarlo, debe registrar una inscripción regular.`,
      );
    }

    const categoryId = dto.categoryId ? Number(dto.categoryId) : activeRegistration?.teamRegistration?.categoryId;
    const originTeamId = activeRegistration?.teamRegistration.teamId;

    // 3. Inscripción del equipo de destino en la edición y la categoría
    const destinationTeamRegistration = await this.teamRegistrationRepo.findOne({
      where: dto.destinationTeamRegistrationId
        ? { id: Number(dto.destinationTeamRegistrationId) }
        : { teamId: Number(dto.destinationTeamId), categoryEditionId: Number(dto.editionId), ...(categoryId ? { categoryId } : {}) },
    });
    if (
      !destinationTeamRegistration ||
      Number(destinationTeamRegistration.teamId) !== Number(dto.destinationTeamId) ||
      Number(destinationTeamRegistration.categoryEditionId) !== Number(dto.editionId)
    ) {
      throw new BadRequestException('El equipo de destino no cuenta con una inscripción en este campeonato.');
    }
    if (categoryId && destinationTeamRegistration.categoryId && Number(destinationTeamRegistration.categoryId) !== Number(categoryId)) {
      throw new BadRequestException('El equipo de destino no está inscrito en la categoría seleccionada.');
    }
    ensureCompanyScope(destinationTeamRegistration, companyId, 'Inscripción del equipo de destino no encontrada');

    // 4. Validar reglas de la edición de torneo
    const config = await this.transferConfigRepo.findOne({ where: { editionId: dto.editionId } });
    if (config) {
      if (!config.transfersEnabled) {
        throw new BadRequestException('El período de transferencias se encuentra cerrado para este campeonato.');
      }
      const now = new Date();
      if (config.transfersStartDate && new Date(config.transfersStartDate) > now) {
        throw new BadRequestException(`El período de transferencias inicia el ${new Date(config.transfersStartDate).toLocaleDateString()}.`);
      }
      if (config.transfersEndDate && new Date(config.transfersEndDate) < now) {
        throw new BadRequestException(`El período de transferencias finalizó el ${new Date(config.transfersEndDate).toLocaleDateString()}.`);
      }

      // Validar máximo de transferencias por jugador en este torneo
      const transfersCount = await this.repo.count({
        where: {
          playerId: dto.playerId,
          editionId: dto.editionId,
          status: TransferStatus.EXECUTED,
        },
      });
      if (transfersCount >= (config.maxTransfersPerPlayer || 2)) {
        throw new BadRequestException(
          `Límite alcanzado: El futbolista ya ha alcanzado el número máximo de transferencias permitidas (${config.maxTransfersPerPlayer || 2}) para este campeonato.`,
        );
      }
    }

    if (activeRegistration && originTeamId === dto.destinationTeamId) {
      throw new BadRequestException('El jugador ya pertenece y se encuentra inscrito en el equipo de destino seleccionado.');
    }

    // 5. Validar que no exista una solicitud de transferencia pendiente en curso para este jugador
    const pendingTransfer = await this.repo.findOne({
      where: {
        playerId: dto.playerId,
        editionId: dto.editionId,
        status: TransferStatus.PENDING_APPROVAL,
      },
    });
    if (pendingTransfer) {
      throw new BadRequestException('Ya existe una solicitud de transferencia en proceso de aprobación para este jugador.');
    }

    // 6. Firmas requeridas según la configuración: el club de origen solo firma si existe; el club destino firma al emitir la orden
    const requiredRoles = [
      ...((!config || config.requireOriginTeamApproval) && activeRegistration ? [TransferApprovalRole.ORIGIN_TEAM] : []),
      ...(!config || config.requireDestinationTeamApproval ? [TransferApprovalRole.DESTINATION_TEAM] : []),
      ...(!config || config.requireAdminApproval ? [TransferApprovalRole.ADMIN] : []),
    ];
    // La orden queda pendiente mientras falte alguna firma
    const initialStatus = requiredRoles.some((role) => role !== TransferApprovalRole.DESTINATION_TEAM) ? TransferStatus.PENDING_APPROVAL : TransferStatus.APPROVED;

    const transfer = this.repo.create({
      ...dto,
      categoryId,
      originTeamId,
      originRegistrationId: activeRegistration?.id,
      companyId,
      status: initialStatus,
      requestDate: new Date(),
      transferDate: dto.transferDate ? new Date(dto.transferDate) : new Date(),
      transferType: dto.transferType || (activeRegistration ? 'DEFINITIVA' : 'LIBRE'),
      passOwnerType: dto.passOwnerType || player.passOwnerType || 'PLAYER',
      passOwnerTeamId: dto.passOwnerType === 'TEAM' ? (dto.passOwnerTeamId || dto.destinationTeamId) : undefined,
      createdBy: user?.user_id?.toString() || user?.id?.toString(),
      createdName: user?.user_name || user?.name,
    });

    const savedTransfer = await this.repo.save(transfer);

    // 7. Generar las aprobaciones requeridas
    const approvalsToCreate: Partial<PlayerTransferApprovalOrmEntity>[] = requiredRoles.map((role) =>
      role === TransferApprovalRole.DESTINATION_TEAM
        ? {
            companyId: savedTransfer.companyId,
            transferId: savedTransfer.id,
            role,
            status: TransferApprovalStatus.APPROVED, // El equipo que solicita aprueba automáticamente su petición
            approverUserId: resolveUserId(user),
            approverName: user?.user_name || user?.name,
            actionDate: new Date(),
            comments: 'Solicitud formal emitida por el club destino',
          }
        : { companyId: savedTransfer.companyId, transferId: savedTransfer.id, role, status: TransferApprovalStatus.PENDING },
    );

    if (approvalsToCreate.length > 0) {
      await this.approvalRepo.save(approvalsToCreate);
    }

    return this.get(savedTransfer.id, companyId);
  }

  /**
   * Aprobar o rechazar una solicitud de transferencia por rol
   */
  async approve(transferId: string | number, dto: ApproveTransferDto, user: any, companyId: number) {
    const transfer = ensureCompanyScope(
      await this.repo.findOne({
        where: { id: Number(transferId) },
        relations: ['approvals', 'player', 'originTeam', 'destinationTeam'],
      }),
      companyId,
      'Solicitud de transferencia no encontrada',
      true,
    );

    if (transfer.status !== TransferStatus.PENDING_APPROVAL) {
      throw new BadRequestException(`No se puede modificar una transferencia en estado "${transfer.status}".`);
    }

    let approval = transfer.approvals.find((a) => a.role === dto.role);
    if (!approval) {
      approval = this.approvalRepo.create({
        companyId: transfer.companyId,
        transferId: transfer.id,
        role: dto.role,
      });
    }

    approval.status = dto.status;
    approval.actionDate = new Date();
    approval.approverUserId = resolveUserId(user);
    approval.approverName = user?.user_name || user?.name;
    approval.comments = dto.comments || (dto.status === TransferApprovalStatus.APPROVED ? 'Aprobado satisfactoriamente' : 'Rechazado');
    await this.approvalRepo.save(approval);

    // Si fue rechazada, marcar la transferencia inmediatamente como REJECTED
    if (dto.status === TransferApprovalStatus.REJECTED) {
      transfer.status = TransferStatus.REJECTED;
      transfer.rejectionReason = `Rechazado por ${dto.role}: ${dto.comments || 'Sin motivo especificado'}`;
      transfer.updatedBy = user?.user_id?.toString() || user?.id?.toString();
      transfer.updateName = user?.user_name || user?.name;
      await this.repo.save(transfer);
      return this.get(transfer.id, companyId);
    }

    // Verificar si todas las aprobaciones obligatorias ya están en APPROVED
    const updatedApprovals = await this.approvalRepo.find({ where: { transferId: Number(transfer.id) } });
    const allApproved = updatedApprovals.every((a) => a.status === TransferApprovalStatus.APPROVED);

    if (allApproved) {
      transfer.status = TransferStatus.APPROVED;
      transfer.updatedBy = user?.user_id?.toString() || user?.id?.toString();
      transfer.updateName = user?.user_name || user?.name;
      await this.repo.save(transfer);
    }

    return this.get(transfer.id, companyId);
  }

  /**
   * Ejecución atómica transaccional de la transferencia
   */
  async execute(transferId: string | number, user: any, companyId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const transferRepo = queryRunner.manager.getRepository(PlayerTransferOrmEntity);
      const playerRepo = queryRunner.manager.getRepository(PlayerOrmEntity);
      const playerRegRepo = queryRunner.manager.getRepository(PlayerRegistrationOrmEntity);
      const teamRegRepo = queryRunner.manager.getRepository(TeamRegistrationOrmEntity);
      const detailRepo = queryRunner.manager.getRepository(EditionCategoryDetailOrmEntity);
      const historyRepo = queryRunner.manager.getRepository(PlayerRegistrationHistoryOrmEntity);

      // 1. Obtener transferencia y validar estado
      const transfer = ensureCompanyScope(
        await transferRepo.findOne({
          where: { id: Number(transferId) },
          relations: ['approvals', 'player', 'originRegistration', 'destinationTeam'],
        }),
        companyId,
        'Transferencia no encontrada',
        true,
      );

      if (transfer.status === TransferStatus.EXECUTED) {
        throw new BadRequestException('Esta transferencia ya fue ejecutada previamente.');
      }
      if (transfer.status !== TransferStatus.APPROVED) {
        throw new BadRequestException('La transferencia debe contar con todas las aprobaciones requeridas antes de ejecutarse.');
      }

      // 2. Si el jugador tenía club de origen, confirmar que sigue inscrito y activo en él
      let originReg: PlayerRegistrationOrmEntity | null = null;
      if (transfer.originRegistrationId) {
        originReg = await playerRegRepo.findOne({ where: { id: transfer.originRegistrationId } });
        if (!originReg || originReg.status === PlayerRegistrationStatus.FINALIZED_BY_TRANSFER) {
          throw new BadRequestException('La inscripción de origen del futbolista ya no se encuentra activa.');
        }
      }

      // 3. Inscripción del equipo destino en esta edición y categoría. Se resuelve siempre por equipo + edición (+ categoría):
      // transfer.destinationRegistrationId es la inscripción del JUGADOR en destino (se crea en el paso 6),
      // no un id de inscripción de equipo, y un where con id undefined devolvería la primera fila de la tabla.
      const targetTeamReg =
        transfer.destinationTeamId && transfer.editionId
          ? await teamRegRepo.findOne({
              where: {
                teamId: transfer.destinationTeamId,
                categoryEditionId: transfer.editionId,
                ...(transfer.categoryId ? { categoryId: transfer.categoryId } : {}),
              },
            })
          : null;
      if (!targetTeamReg) {
        throw new BadRequestException('El equipo de destino no cuenta con una inscripción activa en este campeonato.');
      }

      // La inscripción del jugador en el destino es única por equipo: una anterior finalizada se reincorpora y una vigente impide la transferencia
      const destinationRegs = await playerRegRepo.find({ where: { teamRegistrationId: targetTeamReg.id } });
      const previousDestinationReg = destinationRegs.find((r) => Number(r.playerId) === Number(transfer.playerId));
      if (previousDestinationReg && previousDestinationReg.status !== PlayerRegistrationStatus.FINALIZED_BY_TRANSFER) {
        throw new BadRequestException('El jugador ya se encuentra inscrito en el equipo de destino.');
      }

      // 4. Validar cupos generales y cupos por clasificación en equipo destino (de la categoría del equipo destino)
      const categoryDetails = await detailRepo.find({
        where: { editionId: transfer.editionId },
        relations: ['classifications', 'classifications.playerClassification'],
      });
      const categoryDetail = categoryDetails.find((d) => Number(d.categoryId) === Number(targetTeamReg.categoryId)) || categoryDetails[0] || null;

      if (categoryDetail && categoryDetail.maxPlayers > 0) {
        const currentTotal = await playerRegRepo
          .createQueryBuilder('pr')
          .setLock('pessimistic_write')
          .where('pr.teamRegistrationId = :teamRegistrationId', { teamRegistrationId: targetTeamReg.id })
          .andWhere('pr.status != :finalizedStatus', { finalizedStatus: PlayerRegistrationStatus.FINALIZED_BY_TRANSFER })
          .getCount();

        if (currentTotal >= categoryDetail.maxPlayers) {
          throw new BadRequestException(
            `El equipo destino ya ha alcanzado el límite máximo de ${categoryDetail.maxPlayers} jugadores inscritos. No es posible incorporar más futbolistas.`,
          );
        }
      }

      // Validar cupo de clasificación
      const classificationId = originReg?.playerClassificationId ?? transfer.player?.playerClassificationId ?? null;
      if (categoryDetail && classificationId && categoryDetail.classifications?.length) {
        const classConfig = categoryDetail.classifications.find((c) => c.playerClassificationId === classificationId);
        if (classConfig && classConfig.maxPlayers > 0) {
          const currentClassCount = await playerRegRepo
            .createQueryBuilder('pr')
            .setLock('pessimistic_write')
            .where('pr.teamRegistrationId = :teamRegistrationId', { teamRegistrationId: targetTeamReg.id })
            .andWhere('pr.playerClassificationId = :classificationId', { classificationId })
            .andWhere('pr.status != :finalizedStatus', { finalizedStatus: PlayerRegistrationStatus.FINALIZED_BY_TRANSFER })
            .getCount();

          if (currentClassCount >= classConfig.maxPlayers) {
            throw new BadRequestException(
              `Cupo agotado en equipo destino: La clasificación del jugador ya alcanzó el cupo máximo permitido (${classConfig.maxPlayers}).`,
            );
          }
        }
      }

      // 5. Finalizar la inscripción anterior (si la había)
      if (originReg) {
        const previousStatus = originReg.status;
        originReg.status = PlayerRegistrationStatus.FINALIZED_BY_TRANSFER;
        originReg.updatedBy = user?.user_id?.toString() || user?.id?.toString();
        originReg.updateName = user?.user_name || user?.name;
        await playerRegRepo.save(originReg);

        await historyRepo.save({
          companyId: transfer.companyId,
          playerRegistrationId: originReg.id,
          playerId: transfer.playerId,
          action: PlayerRegistrationHistoryAction.FINALIZED,
          previousStatus,
          newStatus: PlayerRegistrationStatus.FINALIZED_BY_TRANSFER,
          performedById: resolveUserId(user),
          performedByName: user?.user_name || user?.name,
          comments: `Inscripción cerrada por transferencia hacia ${transfer.destinationTeam?.name || 'nuevo club'}`,
        });
      }

      // 6. Inscribir al jugador en el equipo de destino: conserva su dorsal si está libre y, si no, toma el primero disponible
      const usedJerseys = new Set(destinationRegs.filter((r) => r.status !== PlayerRegistrationStatus.FINALIZED_BY_TRANSFER).map((r) => Number(r.jerseyNumber)));
      let jerseyNumber = Number(originReg?.jerseyNumber) || 1;
      while (usedJerseys.has(jerseyNumber)) jerseyNumber++;

      const registrationData = {
        stageId: transfer.stageId || originReg?.stageId,
        playerClassificationId: classificationId,
        demarcationId: originReg?.demarcationId ?? transfer.player?.demarcationId ?? undefined,
        jerseyNumber,
        carnetCode: originReg?.carnetCode || transfer.player?.code || `JUG-${String(transfer.playerId).padStart(5, '0')}`,
        status: PlayerRegistrationStatus.ELIGIBLE,
        isCaptain: false,
        documents: transfer.documents || [],
      };
      const actor = { createdBy: user?.user_id?.toString() || user?.id?.toString(), createdName: user?.user_name || user?.name };

      const savedNewReg = await playerRegRepo.save(
        previousDestinationReg
          ? Object.assign(previousDestinationReg, registrationData, { updatedBy: actor.createdBy, updateName: actor.createdName })
          : playerRegRepo.create({ ...registrationData, teamRegistrationId: targetTeamReg.id, playerId: transfer.playerId, companyId: transfer.companyId, ...actor }),
      );

      await historyRepo.save({
        companyId: transfer.companyId,
        playerRegistrationId: savedNewReg.id,
        playerId: transfer.playerId,
        action: PlayerRegistrationHistoryAction.TRANSFERRED,
        newStatus: PlayerRegistrationStatus.ELIGIBLE,
        performedById: resolveUserId(user),
        performedByName: user?.user_name || user?.name,
        comments: `Inscripción dada de alta mediante ejecución de transferencia #${transfer.id}`,
      });

      // 7. Asociar la nueva inscripción y actualizar la transferencia como EXECUTED
      transfer.destinationRegistrationId = savedNewReg.id;
      transfer.status = TransferStatus.EXECUTED;
      transfer.executionDate = new Date();
      transfer.updatedBy = user?.user_id?.toString() || user?.id?.toString();
      transfer.updateName = user?.user_name || user?.name;
      await transferRepo.save(transfer);

      // 8. Actualizar perfil del jugador
      await playerRepo.update(transfer.playerId, {
        currentTeamId: transfer.destinationTeamId,
        passOwnerType: transfer.passOwnerType,
        passOwnerTeamId: transfer.passOwnerType === 'TEAM' ? (transfer.passOwnerTeamId || transfer.destinationTeamId) : (null as any),
      });

      await queryRunner.commitTransaction();
      return this.get(transfer.id, companyId);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async list(companyId: number, query: FilterTransferQueryDto) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const qb = this.repo
      .createQueryBuilder('pt')
      .leftJoinAndSelect('pt.player', 'player')
      .leftJoinAndSelect('pt.originTeam', 'originTeam')
      .leftJoinAndSelect('pt.destinationTeam', 'destinationTeam')
      .leftJoinAndSelect('pt.passOwnerTeam', 'passOwnerTeam')
      .leftJoinAndSelect('pt.edition', 'edition')
      .leftJoinAndSelect('pt.category', 'category')
      .leftJoinAndSelect('pt.stage', 'stage')
      .leftJoinAndSelect('pt.approvals', 'approvals');

    if (companyId) {
      qb.andWhere('(pt.companyId = :companyId OR pt.companyId IS NULL)', { companyId });
    }
    if (query.editionId) {
      qb.andWhere('pt.editionId = :editionId', { editionId: query.editionId });
    }
    if (query.categoryId) {
      qb.andWhere('pt.categoryId = :categoryId', { categoryId: Number(query.categoryId) });
    }
    if (query.status) {
      qb.andWhere('pt.status = :status', { status: query.status });
    }
    if (query.originTeamId) {
      qb.andWhere('pt.originTeamId = :originTeamId', { originTeamId: query.originTeamId });
    }
    if (query.destinationTeamId) {
      qb.andWhere('pt.destinationTeamId = :destinationTeamId', { destinationTeamId: query.destinationTeamId });
    }
    if (query.playerId) {
      qb.andWhere('pt.playerId = :playerId', { playerId: query.playerId });
    }
    if (query.search?.trim()) {
      qb.andWhere(
        '(LOWER(player.name) LIKE :term OR LOWER(player.lastName) LIKE :term OR LOWER(originTeam.name) LIKE :term OR LOWER(destinationTeam.name) LIKE :term)',
        { term: `%${query.search.trim().toLowerCase()}%` },
      );
    }

    qb.orderBy('pt.createdAt', 'DESC').skip(skip).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async get(id: string | number, companyId: number) {
    const item = await this.repo.findOne({
      where: { id: Number(id) },
      relations: [
        'player',
        'player.demarcation',
        'originTeam',
        'destinationTeam',
        'passOwnerTeam',
        'edition',
        'category',
        'stage',
        'approvals',
      ],
    });
    return ensureCompanyScope(item, companyId, 'Transferencia no encontrada');
  }

  /**
   * Historial deportivo integral del futbolista (inscripciones, transferencias y trayectoria)
   */
  async getSportsHistory(playerId: string | number, companyId: number) {
    const numPlayerId = Number(playerId);
    // El historial solo se entrega a una empresa que tenga al jugador en su padrón
    await assertPlayerInCompany(this.repo.manager, numPlayerId, companyId);
    const player = await this.playerRepo.findOne({
      where: { id: numPlayerId },
      relations: ['demarcation', 'currentTeam', 'passOwnerTeam'],
    });
    if (!player) throw new NotFoundException('Jugador no encontrado');

    const registrations = await this.playerRegistrationRepo.find({
      where: { playerId: numPlayerId },
      relations: ['teamRegistration', 'teamRegistration.team', 'teamRegistration.categoryEdition', 'playerClassification', 'stage'],
      order: { registrationDate: 'DESC' },
    });

    const transfers = await this.repo.find({
      where: { playerId: numPlayerId },
      relations: ['originTeam', 'destinationTeam', 'edition', 'approvals'],
      order: { createdAt: 'DESC' },
    });

    const historyTimeline = await this.historyRepo.find({
      where: { playerId: numPlayerId },
      relations: ['playerRegistration'],
      order: { createdAt: 'DESC' },
    });

    return {
      player,
      registrations,
      transfers,
      timeline: historyTimeline,
    };
  }

  async listByPlayer(playerId: string | number, companyId: number) {
    const numPlayerId = Number(playerId);
    return this.repo.find({
      where: { playerId: numPlayerId, companyId },
      relations: ['player', 'originTeam', 'destinationTeam', 'passOwnerTeam', 'edition', 'category', 'approvals'],
      order: { createdAt: 'DESC' },
    });
  }

  async remove(id: string | number, companyId: number) {
    const item = ensureCompanyScope(
      await this.repo.findOne({ where: { id: Number(id) } }),
      companyId,
      'Transferencia no encontrada',
      true,
    );
    if (item.status === TransferStatus.EXECUTED) {
      throw new BadRequestException('No se puede eliminar una transferencia que ya fue ejecutada.');
    }
    return this.repo.remove(item);
  }
}
