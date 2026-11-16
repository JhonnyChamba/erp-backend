import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { MatchEventType } from '../../common/enum/campeonato.enum';
import { MatchOrmEntity } from './match.orm-entity';
import { TeamOrmEntity } from './team.orm-entity';
import { PlayerOrmEntity } from './player.orm-entity';

@Entity('tab_campeonato_match_events')
export class MatchEventOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id', type: 'int', nullable: true })
  companyId: number;

  @Column({ name: 'tournaments_id', type: 'varchar', nullable: true })
  tournamentId: string;

  @Column({ name: 'match_id', type: 'uuid' })
  matchId: string;

  @ManyToOne(() => MatchOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'match_id' })
  match: MatchOrmEntity;

  @Column({ name: 'team_id', type: 'uuid' })
  teamId: string;

  @ManyToOne(() => TeamOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'team_id' })
  team: TeamOrmEntity;

  @Column({ name: 'player_id', type: 'uuid' })
  playerId: string;

  @ManyToOne(() => PlayerOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'player_id' })
  player: PlayerOrmEntity;

  @Column({ name: 'event_type', type: 'enum', enum: MatchEventType })
  eventType: MatchEventType;

  @Column({ type: 'int', nullable: true })
  minute: number;

  @Column({ name: 'extra_minute', type: 'int', nullable: true })
  extraMinute: number;

  @Column({ name: 'player_out_id', type: 'uuid', nullable: true })
  playerOutId: string;

  @ManyToOne(() => PlayerOrmEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'player_out_id' })
  playerOut: PlayerOrmEntity;

  @Column({ type: 'text', nullable: true })
  notes: string;

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
