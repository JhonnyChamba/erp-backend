import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { CategoryEditionOrmEntity } from './category-edition.orm-entity';

@Entity('tab_campeonato_tournament_transfer_configs')
export class TournamentTransferConfigOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'company_id', type: 'int', nullable: true })
  companyId: number;

  @Column({ name: 'edition_id', type: 'int', unique: true })
  editionId: number;

  @OneToOne(() => CategoryEditionOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'edition_id' })
  edition: CategoryEditionOrmEntity;

  // Configuración de Inscripciones
  @Column({ name: 'inscriptions_enabled', type: 'boolean', default: true })
  inscriptionsEnabled: boolean;

  @Column({ name: 'inscriptions_start_date', type: 'date', nullable: true })
  inscriptionsStartDate: string;

  @Column({ name: 'inscriptions_end_date', type: 'date', nullable: true })
  inscriptionsEndDate: string;

  @Column({ name: 'inscriptions_require_approval', type: 'boolean', default: false })
  inscriptionsRequireApproval: boolean;

  @Column({ name: 'allow_mass_inscription', type: 'boolean', default: true })
  allowMassInscription: boolean;

  @Column({ name: 'allow_reinscription', type: 'boolean', default: false })
  allowReinscription: boolean;

  // Configuración de Transferencias
  @Column({ name: 'transfers_enabled', type: 'boolean', default: true })
  transfersEnabled: boolean;

  @Column({ name: 'transfers_start_date', type: 'date', nullable: true })
  transfersStartDate: string;

  @Column({ name: 'transfers_end_date', type: 'date', nullable: true })
  transfersEndDate: string;

  @Column({ name: 'max_transfers_per_player', type: 'int', default: 2 })
  maxTransfersPerPlayer: number;

  @Column({ name: 'require_origin_team_approval', type: 'boolean', default: true })
  requireOriginTeamApproval: boolean;

  @Column({ name: 'require_destination_team_approval', type: 'boolean', default: true })
  requireDestinationTeamApproval: boolean;

  @Column({ name: 'require_admin_approval', type: 'boolean', default: true })
  requireAdminApproval: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
