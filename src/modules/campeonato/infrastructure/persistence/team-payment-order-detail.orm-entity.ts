import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { PaymentConcept } from '../../common/enum/campeonato.enum';
import { CategoryOrmEntity } from './category.orm-entity';
import { TeamRegistrationOrmEntity } from './team-registration.orm-entity';
import { TeamPaymentOrderOrmEntity } from './team-payment-order.orm-entity';

// Concepto que se cobra en una categoría: tipo de concepto y valor
export interface TeamPaymentOrderConcept {
  conceptType: PaymentConcept;
  description: string;
  amount: number;
}

const numericTransformer = { to: (value?: number) => value, from: (value?: string | null) => (value === null || value === undefined ? value : Number(value)) };

/**
 * Detalle de la orden de pago: una línea por cada categoría en la que quedó inscrito el equipo,
 * con el subdetalle de los conceptos que se cobran (tipo de concepto y valor).
 */
@Entity('tab_campeonato_team_payment_order_details')
export class TeamPaymentOrderDetailOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'order_id', type: 'int' })
  orderId: number;

  @ManyToOne(() => TeamPaymentOrderOrmEntity, (order) => order.details, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: TeamPaymentOrderOrmEntity;

  @Column({ name: 'team_registration_id', type: 'int', nullable: true })
  teamRegistrationId: number;

  @ManyToOne(() => TeamRegistrationOrmEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'team_registration_id' })
  teamRegistration: TeamRegistrationOrmEntity;

  @Column({ name: 'category_id', type: 'int', nullable: true })
  categoryId: number;

  @ManyToOne(() => CategoryOrmEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'category_id' })
  category: CategoryOrmEntity;

  // Nombre de la categoría al momento de generar la orden
  @Column({ name: 'category_name', type: 'varchar', length: 150 })
  categoryName: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0, transformer: numericTransformer })
  subtotal: number;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  concepts: TeamPaymentOrderConcept[];
}
