import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { PlayerRegistrationStatus } from '../../common/enum/campeonato.enum';
import { TeamRegistrationOrmEntity } from './team-registration.orm-entity';
import { PlayerOrmEntity } from './player.orm-entity';

@Entity('tab_campeonato_player_registrations')
@Unique(['teamRegistrationId', 'playerId'])
export class PlayerRegistrationOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id', type: 'int', nullable: true })
  companyId: number;

  @Column({ name: 'tournaments_id', type: 'varchar', nullable: true })
  tournamentId: string;

  @Column({ name: 'team_registration_id', type: 'uuid' })
  teamRegistrationId: string;

  @ManyToOne(() => TeamRegistrationOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'team_registration_id' })
  teamRegistration: TeamRegistrationOrmEntity;

  @Column({ name: 'player_id', type: 'uuid' })
  playerId: string;

  @ManyToOne(() => PlayerOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'player_id' })
  player: PlayerOrmEntity;

  @Column({ name: 'jersey_number', type: 'int' })
  jerseyNumber: number;

  @Column({ name: 'carnet_code', type: 'varchar', length: 50, nullable: true })
  carnetCode: string;

  @Column({ type: 'enum', enum: PlayerRegistrationStatus, default: PlayerRegistrationStatus.ELIGIBLE })
  status: PlayerRegistrationStatus;

  @Column({ name: 'is_captain', type: 'boolean', default: false })
  isCaptain: boolean;

  @Column({ name: 'registration_date', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  registrationDate: Date;

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
