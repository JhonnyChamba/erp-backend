import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { TeamOrigin, StageFormat, IntersectionType } from '../../common/enum/campeonato.enum';
import { CategoryEditionOrmEntity } from './category-edition.orm-entity';

@Entity('tab_campeonato_stages')
export class StageOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id', type: 'int', nullable: true })
  companyId: number;

  @Column({ name: 'tournaments_id', type: 'varchar', nullable: true })
  tournamentId: string;

  @Column({ name: 'category_edition_id', type: 'uuid' })
  categoryEditionId: string;

  @ManyToOne(() => CategoryEditionOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'category_edition_id' })
  categoryEdition: CategoryEditionOrmEntity;

  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'stage_order', type: 'int', default: 1 })
  stageOrder: number;

  @Column({ name: 'team_origin', type: 'enum', enum: TeamOrigin, default: TeamOrigin.FULL_CATEGORY })
  teamOrigin: TeamOrigin;

  @Column({ name: 'previous_stage_id', type: 'uuid', nullable: true })
  previousStageId: string;

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

  @Column({ name: 'predefined_crosses', type: 'jsonb', nullable: true })
  predefinedCrosses: any;

  @Column({ name: 'match_duration_minutes', type: 'int', default: 90 })
  matchDurationMinutes: number;

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
