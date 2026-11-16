import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { CompanyOrmEntity } from 'src/modules/company/infrastructure/persistence/company.orm-entity';
import { BranchCompanyOrmEntity } from 'src/modules/branch-company/infrastructure/persistence/branch-company.orm-entity';
import { CustomerOrmEntity } from 'src/modules/contacts/infrastructure/persistence/contacts.orm-entity';
import { WorkOrderItemOrmEntity } from './work-order-item.orm-entity';

@Entity('tab_work_orders')
export class WorkOrderOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'company_id', type: 'int' })
  company_id: number;

  @ManyToOne(() => CompanyOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: CompanyOrmEntity;

  @Column({ name: 'branch_id', type: 'int', nullable: true })
  branch_id: number | null;

  @ManyToOne(() => BranchCompanyOrmEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'branch_id' })
  branch: BranchCompanyOrmEntity | null;

  @Column({ name: 'customer_id', type: 'int' })
  customer_id: number;

  @ManyToOne(() => CustomerOrmEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'customer_id' })
  customer: CustomerOrmEntity;

  @Column({ name: 'customer_name', type: 'varchar', length: 150, nullable: true })
  customer_name: string | null;

  @Column({ name: 'customer_phone', type: 'varchar', length: 50, nullable: true })
  customer_phone: string | null;

  @Column({ name: 'customer_email', type: 'varchar', length: 150, nullable: true })
  customer_email: string | null;

  @Column({ name: 'technician_id', type: 'int', nullable: true })
  technician_id: number | null;

  @Column({ name: 'technician_name', type: 'varchar', length: 150, nullable: true })
  technician_name: string | null;

  @Column({ name: 'order_number', type: 'varchar', length: 30 })
  order_number: string;

  @Column({ name: 'service_type', type: 'varchar', length: 50, default: 'REPARACION' })
  service_type: string;

  @Column({ name: 'priority', type: 'varchar', length: 20, default: 'MEDIA' })
  priority: string;

  @Column({ name: 'status', type: 'varchar', length: 30, default: 'RECIBIDO' })
  status: string;

  @Column({ name: 'equipment_type', type: 'varchar', length: 50, default: 'Laptop' })
  equipment_type: string;

  @Column({ name: 'brand', type: 'varchar', length: 50, nullable: true })
  brand: string | null;

  @Column({ name: 'model', type: 'varchar', length: 100, nullable: true })
  model: string | null;

  @Column({ name: 'serial_number', type: 'varchar', length: 100, nullable: true })
  serial_number: string | null;

  @Column({ name: 'color', type: 'varchar', length: 50, nullable: true })
  color: string | null;

  @Column({ name: 'security_pin', type: 'varchar', length: 50, nullable: true })
  security_pin: string | null;

  @Column({ name: 'accessories', type: 'text', nullable: true })
  accessories: string | null;

  @Column({ name: 'physical_condition', type: 'text', nullable: true })
  physical_condition: string | null;

  @Column({ name: 'reported_failure', type: 'text' })
  reported_failure: string;

  @Column({ name: 'technical_diagnosis', type: 'text', nullable: true })
  technical_diagnosis: string | null;

  @Column({ name: 'solution_applied', type: 'text', nullable: true })
  solution_applied: string | null;

  @Column({ name: 'entry_date', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  entry_date: Date;

  @Column({ name: 'estimated_delivery_date', type: 'timestamp', nullable: true })
  estimated_delivery_date: Date | null;

  @Column({ name: 'real_delivery_date', type: 'timestamp', nullable: true })
  real_delivery_date: Date | null;

  @Column({ name: 'warranty_days', type: 'int', default: 30 })
  warranty_days: number;

  @Column({
    name: 'labor_cost',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0.0,
    transformer: {
      to: (v: number) => v,
      from: (v: string | null) => (v !== null ? parseFloat(v) : 0.0),
    },
  })
  labor_cost: number;

  @Column({
    name: 'parts_cost',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0.0,
    transformer: {
      to: (v: number) => v,
      from: (v: string | null) => (v !== null ? parseFloat(v) : 0.0),
    },
  })
  parts_cost: number;

  @Column({
    name: 'subtotal',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0.0,
    transformer: {
      to: (v: number) => v,
      from: (v: string | null) => (v !== null ? parseFloat(v) : 0.0),
    },
  })
  subtotal: number;

  @Column({
    name: 'tax_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0.0,
    transformer: {
      to: (v: number) => v,
      from: (v: string | null) => (v !== null ? parseFloat(v) : 0.0),
    },
  })
  tax_amount: number;

  @Column({
    name: 'total_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0.0,
    transformer: {
      to: (v: number) => v,
      from: (v: string | null) => (v !== null ? parseFloat(v) : 0.0),
    },
  })
  total_amount: number;

  @Column({
    name: 'advance_payment',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0.0,
    transformer: {
      to: (v: number) => v,
      from: (v: string | null) => (v !== null ? parseFloat(v) : 0.0),
    },
  })
  advance_payment: number;

  @Column({
    name: 'pending_balance',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0.0,
    transformer: {
      to: (v: number) => v,
      from: (v: string | null) => (v !== null ? parseFloat(v) : 0.0),
    },
  })
  pending_balance: number;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string | null;

  @Column({ default: false })
  deleted: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @OneToMany(() => WorkOrderItemOrmEntity, (item) => item.work_order, { cascade: true })
  items: WorkOrderItemOrmEntity[];
}
