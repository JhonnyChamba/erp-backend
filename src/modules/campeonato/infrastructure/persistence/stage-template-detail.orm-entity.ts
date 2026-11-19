import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { StageTemplateOrmEntity } from './stage-template.orm-entity';
import { CompetitionTypeOrmEntity } from './competition-type.orm-entity';
import { CompetitionLapOrmEntity } from './competition-lap.orm-entity';
import { TieBreakerCriterionOrmEntity } from './tie-breaker-criterion.orm-entity';

@Entity('tab_campeonato_stage_template_details')
export class StageTemplateDetailOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'stage_template_id', type: 'int' })
  stageTemplateId: number;

  @ManyToOne(() => StageTemplateOrmEntity, (template) => template.details, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'stage_template_id' })
  stageTemplate: StageTemplateOrmEntity;

  @Column({ name: 'stage_order', type: 'int', default: 1 })
  stageOrder: number;

  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ name: 'competition_type_id', type: 'int', nullable: true })
  competitionTypeId: number;

  @ManyToOne(() => CompetitionTypeOrmEntity, { nullable: true, onDelete: 'SET NULL', eager: true })
  @JoinColumn({ name: 'competition_type_id' })
  competitionType: CompetitionTypeOrmEntity;

  @Column({ name: 'competition_lap_id', type: 'int', nullable: true })
  competitionLapId: number;

  @ManyToOne(() => CompetitionLapOrmEntity, { nullable: true, onDelete: 'SET NULL', eager: true })
  @JoinColumn({ name: 'competition_lap_id' })
  competitionLap: CompetitionLapOrmEntity;

  @Column({ name: 'tie_breaker_criterion_id', type: 'int', nullable: true })
  tieBreakerCriterionId: number;

  @ManyToOne(() => TieBreakerCriterionOrmEntity, { nullable: true, onDelete: 'SET NULL', eager: true })
  @JoinColumn({ name: 'tie_breaker_criterion_id' })
  tieBreakerCriterion: TieBreakerCriterionOrmEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: true })
  updatedAt: Date;
}
