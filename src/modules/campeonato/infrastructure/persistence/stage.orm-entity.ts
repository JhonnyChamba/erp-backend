import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { TeamOrigin, StageFormat, IntersectionType } from '../../common/enum/campeonato.enum';
import { CategoryEditionOrmEntity } from './category-edition.orm-entity';
import { CategoryOrmEntity } from './category.orm-entity';

@Entity('tab_campeonato_stages')
export class StageOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'company_id', type: 'int', nullable: true })
  companyId: number;

  @Column({ name: 'tournaments_id', type: 'int', nullable: true })
  tournamentId: number;

  @Column({ name: 'category_edition_id', type: 'int' })
  categoryEditionId: number;

  @ManyToOne(() => CategoryEditionOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'category_edition_id' })
  categoryEdition: CategoryEditionOrmEntity;

  @Column({ name: 'category_id', type: 'int', nullable: true })
  categoryId: number;

  @ManyToOne(() => CategoryOrmEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'category_id' })
  category: CategoryOrmEntity;

  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'stage_order', type: 'int', default: 1 })
  stageOrder: number;

  @Column({ name: 'team_origin', type: 'enum', enum: TeamOrigin, default: TeamOrigin.FULL_CATEGORY })
  teamOrigin: TeamOrigin;

  @Column({ name: 'previous_stage_id', type: 'int', nullable: true })
  previousStageId: number;

  @ManyToOne(() => StageOrmEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'previous_stage_id' })
  previousStage: StageOrmEntity;

  @Column({ name: 'number_of_expected_teams', type: 'int', default: 2 })
  numberOfExpectedTeams: number;

  @Column({ type: 'enum', enum: StageFormat, default: StageFormat.EVERYONE_AGAINST_EVERYONE })
  format: StageFormat;

  @Column({ name: 'number_of_laps', type: 'int', default: 1 })
  numberOfLaps: number;

  @Column({ name: 'number_of_groups', type: 'int', nullable: true })
  numberOfGroups: number;

  @Column({ name: 'intersection_type', type: 'enum', enum: IntersectionType, default: IntersectionType.RANDOM_DRAW })
  intersectionType: IntersectionType;

  @Column({ name: 'tie_breaker', type: 'varchar', length: 50, default: 'PENALTIES', nullable: true })
  tieBreaker: string;

  @Column({ name: 'bonus_points', type: 'jsonb', nullable: true })
  bonusPoints: any;

  @Column({ name: 'predefined_crosses', type: 'jsonb', nullable: true })
  predefinedCrosses: any;

  @Column({ name: 'match_duration_minutes', type: 'int', default: 90 })
  matchDurationMinutes: number;

  @Column({ name: 'max_players_per_team', type: 'int', nullable: true, default: 30 })
  maxPlayersPerTeam: number;

  @Column({ name: 'allow_extra_time', type: 'boolean', default: false })
  allowExtraTime: boolean;

  @Column({ name: 'allow_penalties', type: 'boolean', default: false })
  allowPenalties: boolean;

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
