import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { DivisionGroupOrmEntity } from '../../division-groups/infrastructure/persistence/division-group.orm-entity';

@Entity('tab_campeonato_categories')
export class CategoryOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'company_id', type: 'int', nullable: true })
  companyId: number;

  @Column({ name: 'tournaments_id', type: 'int', nullable: true })
  tournamentId: number;

  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  acronyms: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  code: string;

  @Column({ name: 'min_age', type: 'int', nullable: true })
  minAge: number;

  @Column({ name: 'max_age', type: 'int', nullable: true })
  maxAge: number;

  @Column({ name: 'division_group_id', type: 'int', nullable: true })
  divisionGroupId: number;

  @ManyToOne(() => DivisionGroupOrmEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'division_group_id' })
  divisionGroup: DivisionGroupOrmEntity;

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
