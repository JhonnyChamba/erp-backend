import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TournamentTransferConfigOrmEntity } from '../../infrastructure/persistence/tournament-transfer-config.orm-entity';
import { CategoryEditionOrmEntity } from '../../infrastructure/persistence/category-edition.orm-entity';
import { ensureCompanyScope } from '../../common/company-scope.util';
import { UpsertTournamentTransferConfigDto } from './dto/tournament-transfer-config.dto';

@Injectable()
export class TournamentTransferConfigsService {
  constructor(
    @InjectRepository(TournamentTransferConfigOrmEntity)
    private readonly repo: Repository<TournamentTransferConfigOrmEntity>,
    @InjectRepository(CategoryEditionOrmEntity)
    private readonly editionRepo: Repository<CategoryEditionOrmEntity>,
  ) {}

  async getByEdition(editionId: string | number, companyId: number) {
    const numEditionId = Number(editionId);
    // La configuración cuelga de la edición: la edición debe ser de la empresa activa
    const edition = ensureCompanyScope(
      await this.editionRepo.findOne({ where: { id: numEditionId } }),
      companyId,
      'Edición de torneo no encontrada',
    );
    let config = await this.repo.findOne({ where: { editionId: numEditionId } });
    if (!config) {
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

  async upsert(editionId: string | number, dto: UpsertTournamentTransferConfigDto, companyId: number) {
    const numEditionId = Number(editionId);
    const edition = ensureCompanyScope(
      await this.editionRepo.findOne({ where: { id: numEditionId } }),
      companyId,
      'Edición de torneo no encontrada',
      true,
    );

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
