import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { StageOrmEntity } from './stage.orm-entity';
import { PlayerClassificationOrmEntity } from './player-classification.orm-entity';

@Entity('tab_campeonato_stage_player_classifications')
@Unique(['stageId', 'playerClassificationId'])
export class StagePlayerClassificationOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'company_id', type: 'int', nullable: true })
  companyId: number;

  @Column({ name: 'stage_id', type: 'int' })
  stageId: number;

  @ManyToOne(() => StageOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'stage_id' })
  stage: StageOrmEntity;

  @Column({ name: 'player_classification_id', type: 'int' })
  playerClassificationId: number;

  @ManyToOne(() => PlayerClassificationOrmEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'player_classification_id' })
  playerClassification: PlayerClassificationOrmEntity;

  @Column({ name: 'max_players', type: 'int' })
  maxPlayers: number; // Cantidad máxima permitida por equipo para esta clasificación

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
