import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { CategoryOrmEntity } from './category.orm-entity';

@Entity('tab_campeonato_teams')
export class TeamOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'company_id', type: 'int', nullable: true })
  companyId: number;

  @Column({ name: 'tournaments_id', type: 'varchar', nullable: true })
  tournamentId: string;

  @Column({ name: 'current_category_id', type: 'int', nullable: true })
  currentCategoryId: number;

  @ManyToOne(() => CategoryOrmEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'current_category_id' })
  currentCategory: CategoryOrmEntity;

  @Column({ name: 'current_season_year', type: 'varchar', length: 20, default: '2026', nullable: true })
  currentSeasonYear: string;

  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ name: 'short_name', type: 'varchar', length: 80, nullable: true })
  shortName: string;

  @Column({ type: 'text', nullable: true })
  logo: string;

  @Column({ name: 'color_1', type: 'varchar', length: 50, default: '#FFFFFF' })
  color1: string;

  @Column({ name: 'color_2', type: 'varchar', length: 50, nullable: true })
  color2: string;

  @Column({ name: 'color_alternate', type: 'varchar', length: 50, nullable: true })
  colorAlternate: string;

  @Column({ name: 'date_of_foundation', type: 'date', nullable: true })
  dateOfFoundation: Date;

  @Column({ type: 'varchar', length: 20 })
  acronyms: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  email: string;

  @Column({ name: 'representative_phone', type: 'varchar', length: 50, nullable: true })
  representativePhone: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  neighborhood: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

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
