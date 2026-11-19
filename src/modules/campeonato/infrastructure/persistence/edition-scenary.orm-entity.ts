import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { CategoryEditionOrmEntity } from './category-edition.orm-entity';
import { ScenaryOrmEntity } from './scenary.orm-entity';

/**
 * Escenarios (canchas) habilitados para una edición de torneo.
 */
@Entity('tab_campeonato_edition_scenaries')
@Unique(['editionId', 'scenaryId'])
export class EditionScenaryOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'company_id', type: 'int', nullable: true })
  companyId: number;

  @Column({ name: 'edition_id', type: 'int' })
  editionId: number;

  @ManyToOne(() => CategoryEditionOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'edition_id' })
  edition: CategoryEditionOrmEntity;

  @Column({ name: 'scenary_id', type: 'int' })
  scenaryId: number;

  @ManyToOne(() => ScenaryOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'scenary_id' })
  scenary: ScenaryOrmEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
