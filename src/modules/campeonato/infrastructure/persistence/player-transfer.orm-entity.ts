import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { PlayerOrmEntity } from './player.orm-entity';
import { TeamOrmEntity } from './team.orm-entity';
import { CategoryEditionOrmEntity } from './category-edition.orm-entity';
import { PlayerRegistrationOrmEntity } from './player-registration.orm-entity';
import { StageOrmEntity } from './stage.orm-entity';
import { PlayerTransferApprovalOrmEntity } from './player-transfer-approval.orm-entity';
import { TransferStatus } from '../../common/enum/campeonato.enum';

@Entity('tab_campeonato_player_transfers')
export class PlayerTransferOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id', type: 'int', nullable: true })
  companyId: number;

  @Column({ name: 'edition_id', type: 'uuid', nullable: true })
  editionId: string;

  @ManyToOne(() => CategoryEditionOrmEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'edition_id' })
  edition: CategoryEditionOrmEntity;

  @Column({ name: 'player_id', type: 'uuid' })
  playerId: string;

  @ManyToOne(() => PlayerOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'player_id' })
  player: PlayerOrmEntity;

  @Column({ name: 'origin_team_id', type: 'uuid', nullable: true })
  originTeamId: string;

  @ManyToOne(() => TeamOrmEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'origin_team_id' })
  originTeam: TeamOrmEntity;

  @Column({ name: 'origin_registration_id', type: 'uuid', nullable: true })
  originRegistrationId: string;

  @ManyToOne(() => PlayerRegistrationOrmEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'origin_registration_id' })
  originRegistration: PlayerRegistrationOrmEntity;

  @Column({ name: 'destination_team_id', type: 'uuid' })
  destinationTeamId: string;

  @ManyToOne(() => TeamOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'destination_team_id' })
  destinationTeam: TeamOrmEntity;

  @Column({ name: 'destination_registration_id', type: 'uuid', nullable: true })
  destinationRegistrationId: string;

  @ManyToOne(() => PlayerRegistrationOrmEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'destination_registration_id' })
  destinationRegistration: PlayerRegistrationOrmEntity;

  @Column({ name: 'stage_id', type: 'uuid', nullable: true })
  stageId: string;

  @ManyToOne(() => StageOrmEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'stage_id' })
  stage: StageOrmEntity;

  @Column({ type: 'varchar', length: 50, default: TransferStatus.EXECUTED })
  status: TransferStatus;

  @Column({ name: 'request_date', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  requestDate: Date;

  @Column({ name: 'execution_date', type: 'timestamp', nullable: true })
  executionDate: Date;

  @Column({ name: 'season_year', type: 'varchar', length: 20, default: '2026' })
  seasonYear: string;

  @Column({ name: 'transfer_type', type: 'varchar', length: 50, default: 'DEFINITIVA' })
  transferType: string; // 'DEFINITIVA', 'PRESTAMO', 'LIBRE', 'RETORNO'

  @Column({ name: 'pass_owner_type', type: 'varchar', length: 20, default: 'PLAYER' })
  passOwnerType: string; // 'PLAYER' o 'TEAM'

  @Column({ name: 'pass_owner_team_id', type: 'uuid', nullable: true })
  passOwnerTeamId: string;

  @ManyToOne(() => TeamOrmEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'pass_owner_team_id' })
  passOwnerTeam: TeamOrmEntity;

  @Column({ name: 'transfer_fee', type: 'numeric', precision: 12, scale: 2, default: 0 })
  transferFee: number;

  @Column({ name: 'transfer_date', type: 'date', nullable: true })
  transferDate: Date;

  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason: string;

  @Column({ type: 'jsonb', nullable: true, default: '[]' })
  documents: any[];

  @Column({ type: 'text', nullable: true })
  observations: string;

  @OneToMany(() => PlayerTransferApprovalOrmEntity, (a) => a.transfer)
  approvals: PlayerTransferApprovalOrmEntity[];

  @Column({ name: 'created_name', type: 'varchar', nullable: true })
  createdName: string;

  @Column({ name: 'created_by', type: 'varchar', nullable: true })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'update_name', type: 'varchar', nullable: true })
  updateName: string;

  @Column({ name: 'updated_by', type: 'varchar', nullable: true })
  updatedBy: string;

  @UpdateDateColumn({ name: 'updated_at', nullable: true })
  updatedAt: Date;
}
