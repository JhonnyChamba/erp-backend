import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { EditionCategoryDetailOrmEntity } from './edition-category-detail.orm-entity';
import { CompetitionTypeOrmEntity } from './competition-type.orm-entity';
import { CompetitionLapOrmEntity } from './competition-lap.orm-entity';
import { EditionStageTieBreakerOrmEntity } from './edition-stage-tie-breaker.orm-entity';

/**
 * Etapa configurada para una categoría de la edición (subdetalle del detalle de categorías).
 * No es la etapa real del campeonato (`tab_campeonato_stages`): esa se genera a partir de esta configuración.
 */
@Entity('tab_campeonato_edition_category_stages')
export class EditionCategoryStageOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'company_id', type: 'int', nullable: true })
  companyId: number;

  @Column({ name: 'category_detail_id', type: 'int' })
  categoryDetailId: number;

  @ManyToOne(() => EditionCategoryDetailOrmEntity, (detail) => detail.stages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'category_detail_id' })
  categoryDetail: EditionCategoryDetailOrmEntity;

  @Column({ name: 'stage_order', type: 'int', default: 1 })
  stageOrder: number;

  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ name: 'competition_type_id', type: 'int', nullable: true })
  competitionTypeId: number | null;

  @ManyToOne(() => CompetitionTypeOrmEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'competition_type_id' })
  competitionType: CompetitionTypeOrmEntity;

  @Column({ name: 'competition_lap_id', type: 'int', nullable: true })
  competitionLapId: number | null;

  @ManyToOne(() => CompetitionLapOrmEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'competition_lap_id' })
  competitionLap: CompetitionLapOrmEntity;

  // Criterios de desempate de la etapa, en orden de prioridad
  @OneToMany(() => EditionStageTieBreakerOrmEntity, (item) => item.stage)
  tieBreakers: EditionStageTieBreakerOrmEntity[];

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
