import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlayerTransferOrmEntity } from '../../infrastructure/persistence/player-transfer.orm-entity';
import { PlayerOrmEntity } from '../../infrastructure/persistence/player.orm-entity';
import { CreatePlayerTransferDto } from './dto/player-transfer.dto';

@Injectable()
export class PlayerTransfersService {
  constructor(
    @InjectRepository(PlayerTransferOrmEntity)
    private readonly repo: Repository<PlayerTransferOrmEntity>,
    @InjectRepository(PlayerOrmEntity)
    private readonly playerRepo: Repository<PlayerOrmEntity>,
  ) {}

  async listByPlayer(playerId: string, companyId: number) {
    const qb = this.repo
      .createQueryBuilder('pt')
      .leftJoinAndSelect('pt.player', 'player')
      .leftJoinAndSelect('pt.originTeam', 'originTeam')
      .leftJoinAndSelect('pt.destinationTeam', 'destinationTeam')
      .leftJoinAndSelect('pt.passOwnerTeam', 'passOwnerTeam')
      .where('pt.playerId = :playerId', { playerId });

    if (companyId) {
      qb.andWhere('(pt.companyId = :companyId OR pt.companyId IS NULL)', { companyId });
    }

    qb.orderBy('pt.transferDate', 'DESC').addOrderBy('pt.createdAt', 'DESC');
    return qb.getMany();
  }

  async create(dto: CreatePlayerTransferDto, user: any, companyId: number) {
    const player = await this.playerRepo.findOne({ where: { id: dto.playerId } });
    if (!player) throw new NotFoundException('Jugador no encontrado');

    const originTeamId = dto.originTeamId || player.currentTeamId || undefined;

    const record = this.repo.create({
      ...dto,
      originTeamId,
      companyId,
      transferDate: dto.transferDate ? new Date(dto.transferDate) : new Date(),
      passOwnerType: dto.passOwnerType || player.passOwnerType || 'PLAYER',
      passOwnerTeamId: dto.passOwnerType === 'TEAM' ? (dto.passOwnerTeamId || dto.destinationTeamId) : undefined,
      createdBy: user?.user_id?.toString() || user?.id?.toString(),
      createdName: user?.user_name || user?.name,
    });
    const saved = await this.repo.save(record);

    // Actualizar equipo actual y titularidad del pase en el perfil del jugador
    await this.playerRepo.update(dto.playerId, {
      currentTeamId: dto.destinationTeamId,
      passOwnerType: record.passOwnerType,
      passOwnerTeamId: record.passOwnerType === 'TEAM' ? record.passOwnerTeamId : null as any,
    });

    return saved;
  }

  async remove(id: string) {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Transferencia no encontrada');
    return this.repo.remove(item);
  }
}
