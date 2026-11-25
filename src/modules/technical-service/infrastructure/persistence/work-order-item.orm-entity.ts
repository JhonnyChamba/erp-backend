import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { WorkOrderOrmEntity } from './work-order.orm-entity';

@Entity('tab_work_order_items')
export class WorkOrderItemOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'company_id', type: 'int', nullable: true })
  company_id: number;

  @Column({ name: 'work_order_id', type: 'int' })
  work_order_id: number;

  @ManyToOne(() => WorkOrderOrmEntity, (wo) => wo.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'work_order_id' })
  work_order: WorkOrderOrmEntity;

  @Column({ name: 'item_type', type: 'varchar', length: 20, default: 'SERVICIO' })
  item_type: 'REPUESTO' | 'MANO_OBRA' | 'SERVICIO' | 'OTRO';

  @Column({ type: 'varchar', length: 255 })
  description: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 1.0,
    transformer: {
      to: (v: number) => v,
      from: (v: string | null) => (v !== null ? parseFloat(v) : 1.0),
    },
  })
  quantity: number;

  @Column({
    name: 'unit_price',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0.0,
    transformer: {
      to: (v: number) => v,
      from: (v: string | null) => (v !== null ? parseFloat(v) : 0.0),
    },
  })
  unit_price: number;

  @Column({
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
}
