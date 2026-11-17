import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { TeamOrmEntity } from './team.orm-entity';
import { CategoryOrmEntity } from './category.orm-entity';

@Entity('tab_campeonato_team_category_history')
export class TeamCategoryHistoryOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id', type: 'int', nullable: true })
  companyId: number;

  @Column({ name: 'team_id', type: 'uuid' })
  teamId: string;

  @ManyToOne(() => TeamOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'team_id' })
  team: TeamOrmEntity;

  @Column({ name: 'category_id', type: 'uuid' })
  categoryId: string;

  @ManyToOne(() => CategoryOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'category_id' })
  category: CategoryOrmEntity;

  @Column({ name: 'season_year', type: 'varchar', length: 20, default: '2026' })
  seasonYear: string;

  @Column({ type: 'varchar', length: 50, default: 'REGULAR' })
  status: string; // 'ACTUAL', 'ASCENSO', 'DESCENSO', 'REGULAR'

  @Column({ name: 'assigned_date', type: 'date', nullable: true })
  assignedDate: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

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
