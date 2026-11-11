import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne,
	OneToMany,
	JoinColumn,
	Index,
} from 'typeorm';
import { CompanyOrmEntity } from 'src/modules/company/infrastructure/persistence/company.orm-entity';

@Index(['company', 'invoice_number'], { unique: false })
@Entity('tab_purchase')
export class PurchaseOrmEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => CompanyOrmEntity, { nullable: false })
	@JoinColumn({ name: 'company_id' })
	company: CompanyOrmEntity;

	// Proveedor vinculado
	@Column({ type: 'int', nullable: true })
	provider_id: number | null;

	@Column({ length: 200 })
	provider_name: string;

	// 04 = RUC, 05 = Cédula, 06 = Pasaporte
	@Column({ length: 2, default: '04' })
	provider_id_type: string;

	@Column({ length: 20 })
	provider_id_number: string;

	@Column({ length: 150, nullable: true })
	provider_email: string;

	@Column({ length: 30, nullable: true })
	provider_phone: string;

	@Column({ length: 250, nullable: true })
	provider_address: string;

	// Comprobante del proveedor (Ecuador): 001-001-000012345
	@Column({ length: 3, default: '001' })
	establishment: string;

	@Column({ length: 3, default: '001' })
	emission_point: string;

	@Column({ length: 9 })
	sequential: string;

	@Column({ length: 25 })
	invoice_number: string;

	// Clave de acceso o autorización del proveedor (10 o 49 dígitos)
	@Column({ length: 49, nullable: true })
	authorization_number: string;

	@Column({ type: 'date' })
	issue_date: string;

	// Bodega donde ingresa la mercadería
	@Column({ type: 'int' })
	warehouse_id: number;

	@Column({ length: 150, default: 'Bodega Principal' })
	warehouse_name: string;

	// Sucursal receptora (opcional)
	@Column({ type: 'int', nullable: true })
	branch_id: number | null;

	// contado | credito_15 | credito_30 | credito_60 | transferencia
	@Column({ length: 25, default: 'contado' })
	payment_method: string;

	@Column({ type: 'text', nullable: true })
	notes: string;

	// COMPLETED (Confirmada / Ingresada) | CANCELED (Anulada)
	@Column({ length: 20, default: 'COMPLETED' })
	status: string;

	// Valores monetarios
	@Column('numeric', { precision: 12, scale: 2, default: 0 })
	subtotal_zero_tax: number;

	@Column('numeric', { precision: 12, scale: 2, default: 0 })
	subtotal_taxed: number;

	@Column('numeric', { precision: 12, scale: 2, default: 0 })
	tax_value: number;

	@Column('numeric', { precision: 12, scale: 2, default: 0 })
	total: number;

	@OneToMany(() => PurchaseDetailOrmEntity, (d) => d.purchase, { cascade: true })
	details: PurchaseDetailOrmEntity[];

	@Column({ nullable: true })
	created_by: number;

	@CreateDateColumn({ type: 'timestamp' })
	created_at: Date;

	@UpdateDateColumn({ type: 'timestamp' })
	updated_at: Date;
}

@Entity('tab_purchase_detail')
export class PurchaseDetailOrmEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => PurchaseOrmEntity, (p) => p.details, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'purchase_id' })
	purchase: PurchaseOrmEntity;

	// PRODUCT (afecta inventario) | SERVICE | LABOR
	@Column({ length: 20, default: 'PRODUCT' })
	item_type: string;

	@Column({ type: 'int', nullable: true })
	item_id: number;

	@Column({ length: 100, default: '' })
	code: string;

	@Column({ length: 250 })
	description: string;

	@Column({ length: 20, default: 'UND' })
	unit: string;

	@Column('numeric', { precision: 14, scale: 4, default: 1 })
	quantity: number;

	@Column('numeric', { precision: 14, scale: 4, default: 0 })
	unit_cost: number;

	@Column('numeric', { precision: 5, scale: 2, default: 15 })
	tax_rate: number;

	@Column('numeric', { precision: 12, scale: 2, default: 0 })
	tax_value: number;

	@Column('numeric', { precision: 12, scale: 2, default: 0 })
	subtotal: number;

	@Column('numeric', { precision: 12, scale: 2, default: 0 })
	total: number;
}
