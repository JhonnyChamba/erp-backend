import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { EditionCategoryDetailOrmEntity } from './edition-category-detail.orm-entity';
import { PlayerClassificationOrmEntity } from './player-classification.orm-entity';

@Entity('tab_campeonato_edition_category_classifications')
export class EditionCategoryClassificationOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'company_id', type: 'int', nullable: true })
  companyId: number;

  @Column({ name: 'tournaments_id', type: 'int', nullable: true })
  tournamentId: number;

  @Column({ name: 'category_detail_id', type: 'int' })
  categoryDetailId: number;

  @ManyToOne(() => EditionCategoryDetailOrmEntity, (det) => det.classifications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'category_detail_id' })
  categoryDetail: EditionCategoryDetailOrmEntity;

  @Column({ name: 'player_classification_id', type: 'int' })
  playerClassificationId: number;

  @ManyToOne(() => PlayerClassificationOrmEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'player_classification_id' })
  playerClassification: PlayerClassificationOrmEntity;

  @Column({ name: 'max_players', type: 'int', default: 10 })
  maxPlayers: number;

  @Column({ name: 'max_inactivity_months', type: 'int', nullable: true })
  maxInactivityMonths: number;

  @Column({ name: 'max_months', type: 'int', nullable: true })
  maxMonths: number;

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
