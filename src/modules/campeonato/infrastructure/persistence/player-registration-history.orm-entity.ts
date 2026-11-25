import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { PlayerOrmEntity } from './player.orm-entity';
import { PlayerRegistrationOrmEntity } from './player-registration.orm-entity';
import { PlayerRegistrationHistoryAction } from '../../common/enum/campeonato.enum';

@Entity('tab_campeonato_player_registration_history')
export class PlayerRegistrationHistoryOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'company_id', type: 'int', nullable: true })
  companyId: number;

  @Column({ name: 'player_registration_id', type: 'int', nullable: true })
  playerRegistrationId: number;

  @ManyToOne(() => PlayerRegistrationOrmEntity, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'player_registration_id' })
  playerRegistration: PlayerRegistrationOrmEntity;

  @Column({ name: 'player_id', type: 'int' })
  playerId: number;

  @ManyToOne(() => PlayerOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'player_id' })
  player: PlayerOrmEntity;

  @Column({ type: 'varchar', length: 50 })
  action: PlayerRegistrationHistoryAction;

  @Column({ name: 'previous_status', type: 'varchar', length: 50, nullable: true })
  previousStatus: string;

  @Column({ name: 'new_status', type: 'varchar', length: 50, nullable: true })
  newStatus: string;

  @Column({ name: 'performed_by_id', type: 'int', nullable: true })
  performedById: number;

  @Column({ name: 'performed_by_name', type: 'varchar', length: 200, nullable: true })
  performedByName: string;

  @Column({ type: 'text', nullable: true })
  comments: string;

  @Column({ type: 'jsonb', nullable: true, default: '{}' })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
