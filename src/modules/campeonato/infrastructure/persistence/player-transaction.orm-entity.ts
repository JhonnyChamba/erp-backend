import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { PlayerOrmEntity } from './player.orm-entity';
import { CategoryEditionOrmEntity } from './category-edition.orm-entity';

@Entity('tab_campeonato_player_transactions')
export class PlayerTransactionOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'player_id', type: 'uuid' })
  playerId: string;

  @ManyToOne(() => PlayerOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'player_id' })
  player: PlayerOrmEntity;

  @Column({ name: 'company_id', type: 'int' })
  companyId: number;

  @Column({ name: 'edition_id', type: 'uuid', nullable: true })
  editionId: string;

  @ManyToOne(() => CategoryEditionOrmEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'edition_id' })
  edition: CategoryEditionOrmEntity;

  @Column({ name: 'transaction_type', type: 'varchar', length: 50 })
  transactionType: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @Column({ name: 'created_by', type: 'varchar', length: 100, nullable: true })
  createdBy: string;

  @Column({ name: 'created_name', type: 'varchar', length: 150, nullable: true })
  createdName: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
