import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { MatchOrmEntity } from './match.orm-entity';
import { TeamOrmEntity } from './team.orm-entity';
import { PlayerOrmEntity } from './player.orm-entity';

@Entity('tab_campeonato_match_lineups')
@Unique(['matchId', 'playerId'])
export class MatchLineupOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'company_id', type: 'int', nullable: true })
  companyId: number;

  @Column({ name: 'tournaments_id', type: 'int', nullable: true })
  tournamentId: number;

  @Column({ name: 'match_id', type: 'int' })
  matchId: number;

  @ManyToOne(() => MatchOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'match_id' })
  match: MatchOrmEntity;

  @Column({ name: 'team_id', type: 'int' })
  teamId: number;

  @ManyToOne(() => TeamOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'team_id' })
  team: TeamOrmEntity;

  @Column({ name: 'player_id', type: 'int' })
  playerId: number;

  @ManyToOne(() => PlayerOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'player_id' })
  player: PlayerOrmEntity;

  @Column({ name: 'jersey_number', type: 'int' })
  jerseyNumber: number;

  @Column({ name: 'is_starter', type: 'boolean', default: true })
  isStarter: boolean;

  @Column({ name: 'is_captain', type: 'boolean', default: false })
  isCaptain: boolean;

  @Column({ name: 'has_played', type: 'boolean', default: false })
  hasPlayed: boolean;

  @Column({ name: 'minutes_played', type: 'int', default: 0 })
  minutesPlayed: number;

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
