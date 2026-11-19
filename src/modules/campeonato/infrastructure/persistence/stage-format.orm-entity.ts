import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('tab_campeonato_stage_formats')
export class StageFormatOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'company_id', type: 'int', nullable: true })
  companyId: number;

  @Column({ type: 'varchar', length: 50, unique: true, nullable: true })
  code: string;

  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'format_type', type: 'varchar', length: 50, default: 'EVERYONE_AGAINST_EVERYONE' })
  formatType: string;

  @Column({ name: 'default_laps', type: 'int', default: 1 })
  defaultLaps: number;

  @Column({ name: 'default_tie_breaker', type: 'varchar', length: 50, default: 'PENALTIES' })
  defaultTieBreaker: string;

  @Column({ name: 'requires_groups', type: 'boolean', default: false })
  requiresGroups: boolean;

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
