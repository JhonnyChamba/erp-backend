import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { SanctionType, SanctionStatus } from '../../common/enum/campeonato.enum';
import { MatchOrmEntity } from './match.orm-entity';
import { PlayerOrmEntity } from './player.orm-entity';

@Entity('tab_campeonato_sanctions')
export class SanctionOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id', type: 'int', nullable: true })
  companyId: number;

  @Column({ name: 'tournaments_id', type: 'varchar', nullable: true })
  tournamentId: string;

  @Column({ name: 'match_id', type: 'uuid', nullable: true })
  matchId: string;

  @ManyToOne(() => MatchOrmEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'match_id' })
  match: MatchOrmEntity;

  @Column({ name: 'player_id', type: 'uuid' })
  playerId: string;

  @ManyToOne(() => PlayerOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'player_id' })
  player: PlayerOrmEntity;

  @Column({ type: 'enum', enum: SanctionType })
  type: SanctionType;

  @Column({ name: 'matches_suspended', type: 'int', default: 1 })
  matchesSuspended: number;

  @Column({ name: 'matches_served', type: 'int', default: 0 })
  matchesServed: number;

  @Column({ name: 'fine_amount', type: 'numeric', precision: 10, scale: 2, default: 0 })
  fineAmount: number;

  @Column({ type: 'enum', enum: SanctionStatus, default: SanctionStatus.PENDING })
  status: SanctionStatus;

  @Column({ type: 'text', nullable: true })
  description: string;

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
