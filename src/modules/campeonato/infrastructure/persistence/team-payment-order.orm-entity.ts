import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { PaymentOrderStatus } from '../../common/enum/campeonato.enum';
import { CategoryEditionOrmEntity } from './category-edition.orm-entity';
import { TeamOrmEntity } from './team.orm-entity';
import { TeamPaymentOrderDetailOrmEntity } from './team-payment-order-detail.orm-entity';

// numeric llega como texto desde Postgres: se expone como número
const numericTransformer = { to: (value?: number) => value, from: (value?: string | null) => (value === null || value === undefined ? value : Number(value)) };

/**
 * Orden de pago de la inscripción de un equipo en una edición del torneo (cabecera).
 * Se genera al inscribir al equipo; el detalle trae una línea por cada categoría inscrita.
 */
@Entity('tab_campeonato_team_payment_orders')
export class TeamPaymentOrderOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'company_id', type: 'int', nullable: true })
  companyId: number;

  @Column({ name: 'category_edition_id', type: 'int', nullable: true })
  categoryEditionId: number;

  @ManyToOne(() => CategoryEditionOrmEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'category_edition_id' })
  categoryEdition: CategoryEditionOrmEntity;

  // Nombre de la edición al momento de generar la orden
  @Column({ name: 'edition_name', type: 'varchar', length: 150 })
  editionName: string;

  @Column({ name: 'team_id', type: 'int', nullable: true })
  teamId: number;

  @ManyToOne(() => TeamOrmEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'team_id' })
  team: TeamOrmEntity;

  // Nombre del equipo al momento de generar la orden
  @Column({ name: 'team_name', type: 'varchar', length: 150 })
  teamName: string;

  @Column({ name: 'total_amount', type: 'numeric', precision: 12, scale: 2, default: 0, transformer: numericTransformer })
  totalAmount: number;

  @Column({ type: 'varchar', length: 20, default: PaymentOrderStatus.PENDING })
  status: PaymentOrderStatus;

  @OneToMany(() => TeamPaymentOrderDetailOrmEntity, (detail) => detail.order)
  details: TeamPaymentOrderDetailOrmEntity[];

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
