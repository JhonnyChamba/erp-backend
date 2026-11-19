import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { EditionStatus } from '../../common/enum/campeonato.enum';
import { CategoryOrmEntity } from './category.orm-entity';
import { EditionCategoryDetailOrmEntity } from './edition-category-detail.orm-entity';

@Entity('tab_campeonato_category_editions')
export class CategoryEditionOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'company_id', type: 'int', nullable: true })
  companyId: number;

  @Column({ name: 'tournaments_id', type: 'varchar', nullable: true })
  tournamentId: string;

  @Column({ name: 'category_id', type: 'int', nullable: true })
  categoryId: number;

  @ManyToOne(() => CategoryOrmEntity, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'category_id' })
  category: CategoryOrmEntity;

  @OneToMany(() => EditionCategoryDetailOrmEntity, (detail) => detail.edition, { cascade: true })
  categoriesDetail: EditionCategoryDetailOrmEntity[];

  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'start_date', type: 'date', nullable: true })
  startDate: Date;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate: Date;

  @Column({ type: 'enum', enum: EditionStatus, default: EditionStatus.IN_PROGRESS })
  status: EditionStatus;

  @Column({ name: 'min_players_per_team', type: 'int', default: 7 })
  minPlayersPerTeam: number;

  @Column({ name: 'max_players_per_team', type: 'int', default: 25 })
  maxPlayersPerTeam: number;

  @Column({ name: 'min_players_per_match', type: 'int', default: 7 })
  minPlayersPerMatch: number;

  @Column({ name: 'registration_fee', type: 'numeric', precision: 10, scale: 2, default: 0 })
  registrationFee: number;

  @Column({ name: 'guarantee_fee', type: 'numeric', precision: 10, scale: 2, default: 0 })
  guaranteeFee: number;

  @Column({ name: 'points_win', type: 'int', default: 3 })
  pointsWin: number;

  @Column({ name: 'points_draw', type: 'int', default: 1 })
  pointsDraw: number;

  @Column({ name: 'points_loss', type: 'int', default: 0 })
  pointsLoss: number;

  @Column({ name: 'match_duration_minutes', type: 'int', default: 60 })
  matchDurationMinutes: number;

  @Column({ name: 'break_duration_minutes', type: 'int', default: 10 })
  breakDurationMinutes: number;

  @Column({ name: 'wait_between_matches_minutes', type: 'int', default: 10 })
  waitBetweenMatchesMinutes: number;

  @Column({ name: 'available_scenary_ids', type: 'jsonb', nullable: true, default: () => "'[]'" })
  availableScenaryIds: string[];

  @Column({ name: 'identify_by_player_code', type: 'boolean', default: false })
  identifyByPlayerCode: boolean;

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
