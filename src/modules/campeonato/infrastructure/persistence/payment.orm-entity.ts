import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { PaymentConcept, PaymentMethod, PaymentStatus } from '../../common/enum/campeonato.enum';
import { TeamRegistrationOrmEntity } from './team-registration.orm-entity';

@Entity('tab_campeonato_payments')
export class PaymentOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'company_id', type: 'int', nullable: true })
  companyId: number;

  @Column({ name: 'tournaments_id', type: 'varchar', nullable: true })
  tournamentId: string;

  @Column({ name: 'team_registration_id', type: 'int', nullable: true })
  teamRegistrationId: number;

  @ManyToOne(() => TeamRegistrationOrmEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'team_registration_id' })
  teamRegistration: TeamRegistrationOrmEntity;

  @Column({ type: 'enum', enum: PaymentConcept })
  concept: PaymentConcept;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  amount: number;

  @Column({ name: 'payment_method', type: 'enum', enum: PaymentMethod, default: PaymentMethod.CASH })
  paymentMethod: PaymentMethod;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PAID })
  status: PaymentStatus;

  @Column({ name: 'receipt_number', type: 'varchar', length: 100, nullable: true })
  receiptNumber: string;

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
