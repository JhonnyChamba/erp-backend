import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { EditionCategoryStageOrmEntity } from './edition-category-stage.orm-entity';
import { TieBreakerCriterionOrmEntity } from './tie-breaker-criterion.orm-entity';

/** Criterio de desempate de una etapa de la edición; `priorityOrder` es su posición en la jerarquía (1 = primero). */
@Entity('tab_campeonato_edition_stage_tie_breakers')
@Unique('UQ_tab_campeonato_edition_stage_tie_breakers_stage_criterion', ['editionStageId', 'tieBreakerCriterionId'])
export class EditionStageTieBreakerOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'company_id', type: 'int', nullable: true })
  companyId: number;

  @Column({ name: 'edition_stage_id', type: 'int' })
  editionStageId: number;

  @ManyToOne(() => EditionCategoryStageOrmEntity, (stage) => stage.tieBreakers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'edition_stage_id' })
  stage: EditionCategoryStageOrmEntity;

  @Column({ name: 'tie_breaker_criterion_id', type: 'int' })
  tieBreakerCriterionId: number;

  @ManyToOne(() => TieBreakerCriterionOrmEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'tie_breaker_criterion_id' })
  tieBreakerCriterion: TieBreakerCriterionOrmEntity;

  @Column({ name: 'priority_order', type: 'int', default: 1 })
  priorityOrder: number;

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
