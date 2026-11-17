import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { RefereeOrmEntity } from './referee.orm-entity';

@Entity('tab_campeonato_company_referees')
export class CompanyRefereeOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id', type: 'int' })
  companyId: number;

  @Column({ name: 'referee_id', type: 'uuid' })
  refereeId: string;

  @ManyToOne(() => RefereeOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'referee_id' })
  referee: RefereeOrmEntity;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: true })
  updatedAt: Date;
}
