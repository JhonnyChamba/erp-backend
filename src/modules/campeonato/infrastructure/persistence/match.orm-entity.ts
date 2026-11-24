import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { MatchStatus, MeetingType } from '../../common/enum/campeonato.enum';
import { StageOrmEntity } from './stage.orm-entity';
import { ScenaryOrmEntity } from './scenary.orm-entity';
import { TeamOrmEntity } from './team.orm-entity';
import { RefereeOrmEntity } from './referee.orm-entity';
import { VocalOrmEntity } from './vocal.orm-entity';

@Entity('tab_campeonato_matches')
export class MatchOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'company_id', type: 'int', nullable: true })
  companyId: number;

  @Column({ name: 'tournaments_id', type: 'int', nullable: true })
  tournamentId: number;

  @Column({ name: 'stage_id', type: 'int' })
  stageId: number;

  @ManyToOne(() => StageOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'stage_id' })
  stage: StageOrmEntity;

  @Column({ name: 'scenary_id', type: 'int', nullable: true })
  scenaryId: number;

  @ManyToOne(() => ScenaryOrmEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'scenary_id' })
  scenary: ScenaryOrmEntity;

  @Column({ name: 'local_team_id', type: 'int' })
  localTeamId: number;

  @ManyToOne(() => TeamOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'local_team_id' })
  localTeam: TeamOrmEntity;

  @Column({ name: 'away_team_id', type: 'int' })
  awayTeamId: number;

  @ManyToOne(() => TeamOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'away_team_id' })
  awayTeam: TeamOrmEntity;

  // Nula mientras el partido no esté programado (el fixture no asigna días, horarios ni canchas)
  @Column({ type: 'timestamp', nullable: true })
  date: Date;

  @Column({ name: 'round_number', type: 'int', nullable: true })
  roundNumber: number;

  @Column({ name: 'home_goals', type: 'int', default: 0 })
  homeGoals: number;

  @Column({ name: 'away_goals', type: 'int', default: 0 })
  awayGoals: number;

  @Column({ name: 'home_extra_goals', type: 'int', nullable: true })
  homeExtraGoals: number;

  @Column({ name: 'away_extra_goals', type: 'int', nullable: true })
  awayExtraGoals: number;

  @Column({ name: 'home_penalties', type: 'int', nullable: true })
  homePenalties: number;

  @Column({ name: 'away_penalties', type: 'int', nullable: true })
  awayPenalties: number;

  @Column({ name: 'winner_team_id', type: 'int', nullable: true })
  winnerTeamId: number;

  @Column({ type: 'enum', enum: MatchStatus, default: MatchStatus.SCHEDULED })
  status: MatchStatus;

  @Column({ name: 'meeting_type', type: 'enum', enum: MeetingType, default: MeetingType.UNICO })
  meetingType: MeetingType;

  @Column({ name: 'llave_id', type: 'varchar', length: 50, nullable: true })
  llaveId: string;

  @Column({ name: 'is_walkover', type: 'boolean', default: false })
  isWalkover: boolean;

  @Column({ name: 'referee_id', type: 'int', nullable: true })
  refereeId: number;

  @ManyToOne(() => RefereeOrmEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'referee_id' })
  referee: RefereeOrmEntity;

  @Column({ name: 'vocal_id', type: 'int', nullable: true })
  vocalId: number;

  @ManyToOne(() => VocalOrmEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'vocal_id' })
  vocal: VocalOrmEntity;

  @Column({ name: 'vocal_team_id', type: 'int', nullable: true })
  vocalTeamId: number;

  @ManyToOne(() => TeamOrmEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'vocal_team_id' })
  vocalTeam: TeamOrmEntity;

  @Column({ name: 'vocal_member_name', type: 'varchar', length: 150, nullable: true })
  vocalMemberName: string;

  @Column({ name: 'vocal_observations', type: 'text', nullable: true })
  vocalObservations: string;

  @Column({ name: 'referee_observations', type: 'text', nullable: true })
  refereeObservations: string;

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
