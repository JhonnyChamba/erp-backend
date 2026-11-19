import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TournamentTransferConfigOrmEntity } from '../../infrastructure/persistence/tournament-transfer-config.orm-entity';
import { CategoryEditionOrmEntity } from '../../infrastructure/persistence/category-edition.orm-entity';
import { UpsertTournamentTransferConfigDto } from './dto/tournament-transfer-config.dto';

@Injectable()
export class TournamentTransferConfigsService {
  constructor(
    @InjectRepository(TournamentTransferConfigOrmEntity)
    private readonly repo: Repository<TournamentTransferConfigOrmEntity>,
    @InjectRepository(CategoryEditionOrmEntity)
    private readonly editionRepo: Repository<CategoryEditionOrmEntity>,
  ) {}

  async getByEdition(editionId: string | number, companyId?: number) {
    const numEditionId = Number(editionId);
    let config = await this.repo.findOne({ where: { editionId: numEditionId } });
    if (!config) {
      const edition = await this.editionRepo.findOne({ where: { id: numEditionId } });
      if (!edition) {
        throw new NotFoundException('Edición de torneo no encontrada');
      }
      config = this.repo.create({
        editionId: numEditionId,
        companyId: companyId || edition.companyId,
        inscriptionsEnabled: true,
        inscriptionsRequireApproval: false,
        allowMassInscription: true,
        allowReinscription: false,
        transfersEnabled: true,
        maxTransfersPerPlayer: 2,
        requireOriginTeamApproval: true,
        requireDestinationTeamApproval: true,
        requireAdminApproval: true,
      });
      config = await this.repo.save(config);
    }
    return config;
  }

  async upsert(editionId: string | number, dto: UpsertTournamentTransferConfigDto, companyId?: number) {
    const numEditionId = Number(editionId);
    const edition = await this.editionRepo.findOne({ where: { id: numEditionId } });
    if (!edition) {
      throw new NotFoundException('Edición de torneo no encontrada');
    }

    let config = await this.repo.findOne({ where: { editionId: numEditionId } });
    if (config) {
      Object.assign(config, dto);
      if (companyId) config.companyId = companyId;
    } else {
      config = this.repo.create({
        ...dto,
        editionId: numEditionId,
        companyId: companyId || edition.companyId,
      });
    }
    return this.repo.save(config);
  }
}
