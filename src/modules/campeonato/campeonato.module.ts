import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { ModuleOrmEntity } from '../module/infrastructure/persistence/module.orm-entity';
import { subModulesOrmEntity } from '../sub-module/infrastructure/persistence/sub-module.orm-entity';

// Entidades de Campeonato
import { PositionOrmEntity } from './infrastructure/persistence/position.orm-entity';
import { DemarcationOrmEntity } from './infrastructure/persistence/demarcation.orm-entity';
import { TeamOrmEntity } from './infrastructure/persistence/team.orm-entity';
import { PlayerOrmEntity } from './infrastructure/persistence/player.orm-entity';
import { TournamentCommitteeOrmEntity } from './infrastructure/persistence/tournament-committee.orm-entity';
import { TeamManagementOrmEntity } from './infrastructure/persistence/team-management.orm-entity';
import { CategoryOrmEntity } from './infrastructure/persistence/category.orm-entity';
import { CategoryEditionOrmEntity } from './infrastructure/persistence/category-edition.orm-entity';
import { StageOrmEntity } from './infrastructure/persistence/stage.orm-entity';
import { ScenaryOrmEntity } from './infrastructure/persistence/scenary.orm-entity';
import { TeamRegistrationOrmEntity } from './infrastructure/persistence/team-registration.orm-entity';
import { PlayerRegistrationOrmEntity } from './infrastructure/persistence/player-registration.orm-entity';
import { RefereeOrmEntity } from './infrastructure/persistence/referee.orm-entity';
import { VocalOrmEntity } from './infrastructure/persistence/vocal.orm-entity';
import { MatchOrmEntity } from './infrastructure/persistence/match.orm-entity';
import { MatchLineupOrmEntity } from './infrastructure/persistence/match-lineup.orm-entity';
import { MatchEventOrmEntity } from './infrastructure/persistence/match-event.orm-entity';
import { SanctionOrmEntity } from './infrastructure/persistence/sanction.orm-entity';
import { PaymentOrmEntity } from './infrastructure/persistence/payment.orm-entity';

// Controladores de cada apartado
import { PositionsController } from './positions/presentation/positions.controller';
import { DemarcationsController } from './demarcations/presentation/demarcations.controller';
import { TeamsController } from './teams/presentation/teams.controller';
import { PlayersController } from './players/presentation/players.controller';
import { CategoriesController } from './categories/presentation/categories.controller';
import { CategoryEditionsController } from './category-editions/presentation/category-editions.controller';
import { StagesController } from './stages/presentation/stages.controller';
import { ScenariesController } from './scenaries/presentation/scenaries.controller';
import { TeamRegistrationsController } from './team-registrations/presentation/team-registrations.controller';
import { PlayerRegistrationsController } from './player-registrations/presentation/player-registrations.controller';
import { RefereesController } from './referees/presentation/referees.controller';
import { VocalsController } from './vocals/presentation/vocals.controller';
import { MatchesController } from './matches/presentation/matches.controller';
import { MatchLineupsController } from './match-lineups/presentation/match-lineups.controller';
import { MatchEventsController } from './match-events/presentation/match-events.controller';
import { SanctionsController } from './sanctions/presentation/sanctions.controller';
import { PaymentsController } from './payments/presentation/payments.controller';
import { TournamentCommitteesController } from './committees/presentation/tournament-committees.controller';
import { TeamManagementsController } from './team-managements/presentation/team-managements.controller';

// Servicios de cada apartado
import { PositionsService } from './positions/application/positions.service';
import { DemarcationsService } from './demarcations/application/demarcations.service';
import { TeamsService } from './teams/application/teams.service';
import { PlayersService } from './players/application/players.service';
import { CategoriesService } from './categories/application/categories.service';
import { CategoryEditionsService } from './category-editions/application/category-editions.service';
import { StagesService } from './stages/application/stages.service';
import { ScenariesService } from './scenaries/application/scenaries.service';
import { TeamRegistrationsService } from './team-registrations/application/team-registrations.service';
import { PlayerRegistrationsService } from './player-registrations/application/player-registrations.service';
import { RefereesService } from './referees/application/referees.service';
import { VocalsService } from './vocals/application/vocals.service';
import { MatchesService } from './matches/application/matches.service';
import { MatchLineupsService } from './match-lineups/application/match-lineups.service';
import { MatchEventsService } from './match-events/application/match-events.service';
import { SanctionsService } from './sanctions/application/sanctions.service';
import { PaymentsService } from './payments/application/payments.service';
import { TournamentCommitteesService } from './committees/application/tournament-committees.service';
import { TeamManagementsService } from './team-managements/application/team-managements.service';

const entities = [
  PositionOrmEntity,
  DemarcationOrmEntity,
  TeamOrmEntity,
  PlayerOrmEntity,
  TournamentCommitteeOrmEntity,
  TeamManagementOrmEntity,
  CategoryOrmEntity,
  CategoryEditionOrmEntity,
  StageOrmEntity,
  ScenaryOrmEntity,
  TeamRegistrationOrmEntity,
  PlayerRegistrationOrmEntity,
  RefereeOrmEntity,
  VocalOrmEntity,
  MatchOrmEntity,
  MatchLineupOrmEntity,
  MatchEventOrmEntity,
  SanctionOrmEntity,
  PaymentOrmEntity,
  ModuleOrmEntity,
  subModulesOrmEntity,
];

const controllers = [
  PositionsController,
  DemarcationsController,
  TeamsController,
  PlayersController,
  CategoriesController,
  CategoryEditionsController,
  StagesController,
  ScenariesController,
  TeamRegistrationsController,
  PlayerRegistrationsController,
  RefereesController,
  VocalsController,
  MatchesController,
  MatchLineupsController,
  MatchEventsController,
  SanctionsController,
  PaymentsController,
  TournamentCommitteesController,
  TeamManagementsController,
];

const providers = [
  PositionsService,
  DemarcationsService,
  TeamsService,
  PlayersService,
  CategoriesService,
  CategoryEditionsService,
  StagesService,
  ScenariesService,
  TeamRegistrationsService,
  PlayerRegistrationsService,
  RefereesService,
  VocalsService,
  MatchesService,
  MatchLineupsService,
  MatchEventsService,
  SanctionsService,
  PaymentsService,
  TournamentCommitteesService,
  TeamManagementsService,
];

@Module({
  imports: [TypeOrmModule.forFeature(entities)],
  controllers,
  providers,
  exports: [...providers, TypeOrmModule],
})
export class CampeonatoModule implements OnModuleInit {
  private readonly logger = new Logger(CampeonatoModule.name);

  constructor(private readonly dataSource: DataSource) {}

  async onModuleInit() {
    try {
      const moduleRepo = this.dataSource.getRepository(ModuleOrmEntity);
      const subModuleRepo = this.dataSource.getRepository(subModulesOrmEntity);

      let campMod = await moduleRepo.findOne({
        where: [{ code: 'MOD-010' }, { description: 'Campeonato' }],
      });

      if (!campMod) {
        campMod = moduleRepo.create({
          code: 'MOD-010',
          description: 'Campeonato',
          desc_icon: 'solar:cup-first-bold-duotone',
          order_index: 10,
          enabled: true,
          deleted: false,
        });
        campMod = await moduleRepo.save(campMod);
        this.logger.log('Módulo Campeonato registrado automáticamente (MOD-010)');
      }

      const submodules = [
        { code: 'SUB-CAMP-001', icon: 'solar:shield-star-bold-duotone', desc: 'Equipos', url: '/campeonato/equipos', order: 1 },
        { code: 'SUB-CAMP-002', icon: 'solar:user-bold-duotone', desc: 'Jugadores', url: '/campeonato/jugadores', order: 2 },
        { code: 'SUB-CAMP-003', icon: 'solar:layers-bold-duotone', desc: 'Categorías', url: '/campeonato/categorias', order: 3 },
        { code: 'SUB-CAMP-004', icon: 'solar:calendar-date-bold-duotone', desc: 'Ediciones de Categoría', url: '/campeonato/ediciones', order: 4 },
        { code: 'SUB-CAMP-005', icon: 'solar:flag-2-bold-duotone', desc: 'Etapas y Fases', url: '/campeonato/etapas', order: 5 },
        { code: 'SUB-CAMP-006', icon: 'solar:map-point-bold-duotone', desc: 'Escenarios Deportivos', url: '/campeonato/escenarios', order: 6 },
        { code: 'SUB-CAMP-007', icon: 'solar:users-group-two-rounded-bold-duotone', desc: 'Inscripción de Equipos', url: '/campeonato/inscripciones-equipos', order: 7 },
        { code: 'SUB-CAMP-008', icon: 'solar:card-2-bold-duotone', desc: 'Inscripción y Carnets', url: '/campeonato/inscripciones-jugadores', order: 8 },
        { code: 'SUB-CAMP-009', icon: 'solar:whistle-bold-duotone', desc: 'Árbitros', url: '/campeonato/arbitros', order: 9 },
        { code: 'SUB-CAMP-010', icon: 'solar:notebook-bold-duotone', desc: 'Vocales', url: '/campeonato/vocales', order: 10 },
        { code: 'SUB-CAMP-011', icon: 'solar:football-bold-duotone', desc: 'Partidos y Encuentros', url: '/campeonato/partidos', order: 11 },
        { code: 'SUB-CAMP-012', icon: 'solar:danger-triangle-bold-duotone', desc: 'Sanciones y Multas', url: '/campeonato/sanciones', order: 12 },
        { code: 'SUB-CAMP-013', icon: 'solar:wallet-money-bold-duotone', desc: 'Pagos e Ingresos', url: '/campeonato/pagos', order: 13 },
        { code: 'SUB-CAMP-014', icon: 'solar:diploma-verified-bold-duotone', desc: 'Cargos y Roles', url: '/campeonato/cargos', order: 14 },
        { code: 'SUB-CAMP-015', icon: 'solar:compass-bold-duotone', desc: 'Demarcaciones', url: '/campeonato/demarcaciones', order: 15 },
      ];

      for (const sm of submodules) {
        let item = await subModuleRepo.findOne({ where: { code: sm.code } });
        if (!item) {
          item = subModuleRepo.create({
            code: sm.code,
            desc_icon: sm.icon,
            description: sm.desc,
            url_desc: sm.url,
            order_index: sm.order,
            module: campMod,
            enabled: true,
            deleted: false,
          });
          await subModuleRepo.save(item);
        } else if (item.url_desc !== sm.url) {
          item.url_desc = sm.url;
          await subModuleRepo.save(item);
        }
      }
    } catch (e: any) {
      this.logger.warn(`No se pudo autosembrar el módulo de Campeonato: ${e.message}`);
    }
  }
}
