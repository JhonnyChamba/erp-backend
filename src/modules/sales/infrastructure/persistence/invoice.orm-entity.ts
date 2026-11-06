import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	ManyToOne,
	OneToMany,
	JoinColumn,
} from 'typeorm';
import { CompanyOrmEntity } from 'src/modules/company/infrastructure/persistence/company.orm-entity';

@Entity('tab_invoice')
export class InvoiceOrmEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => CompanyOrmEntity, { nullable: false })
	@JoinColumn({ name: 'company_id' })
	company: CompanyOrmEntity;

	// Secuencial SRI Ecuador: Ej: 001-001-000000001
	@Column({ length: 3, default: '001' })
	establishment: string; // Establecimiento

	@Column({ length: 3, default: '001' })
	emission_point: string; // Punto de emisión

	@Column({ length: 9 })
	sequential: string; // 9 dígitos secuenciales

	@Column({ length: 25, unique: true })
	invoice_number: string; // 001-001-000000001

	@Column({ type: 'date' })
	issue_date: string; // Fecha de emisión

	// Cliente (Normativa SRI)
	// 04 = RUC, 05 = Cédula, 06 = Pasaporte, 07 = Consumidor Final, 08 = Identificación Exterior
	@Column({ length: 2, default: '05' })
	customer_id_type: string;

	@Column({ length: 20 })
	customer_id_number: string; // RUC / CI

	@Column({ length: 200 })
	customer_name: string; // Razón Social o Nombre

	@Column({ length: 200, nullable: true })
	customer_address: string;

	@Column({ length: 100, nullable: true })
	customer_email: string;

	@Column({ length: 25, nullable: true })
	customer_phone: string;

	// Forma de pago SRI:
	// 01 = Sin utilización del sistema financiero (Efectivo)
	// 16 = Tarjeta de débito
	// 19 = Tarjeta de crédito
	// 20 = Otros con utilización del sistema financiero (Transferencia/Cheque)
	@Column({ length: 2, default: '01' })
	payment_method: string;

	// Clave de Acceso SRI (49 dígitos numéricos para facturación electrónica)
	@Column({ length: 49, nullable: true })
	access_key: string;

	// Estado de la factura: DRAFT, ISSUED, AUTHORIZED, CANCELED
	@Column({ length: 20, default: 'ISSUED' })
	status: string;

	// Valores monetarios
	@Column('numeric', { precision: 12, scale: 2, default: 0 })
	subtotal_zero_tax: number; // Subtotal 0%

	@Column('numeric', { precision: 12, scale: 2, default: 0 })
	subtotal_taxable: number; // Subtotal gravado (15% o 5%)

	@Column('numeric', { precision: 12, scale: 2, default: 0 })
	subtotal: number; // Subtotal total sin impuestos

	@Column('numeric', { precision: 12, scale: 2, default: 0 })
	discount_total: number; // Descuento total

	@Column('numeric', { precision: 12, scale: 2, default: 0 })
	tax_total: number; // Monto de IVA total

	@Column('numeric', { precision: 12, scale: 2, default: 0 })
	total: number; // Total a pagar

	@Column({ type: 'text', nullable: true })
	notes: string;

	@Column({ nullable: true })
	created_by: number;

	@Column({ default: true })
	enabled: boolean;

	@Column({ default: false })
	deleted: boolean;

	@OneToMany(() => InvoiceDetailOrmEntity, (d) => d.invoice, { cascade: true })
	details: InvoiceDetailOrmEntity[];

	@CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
	created_at: Date;
}

@Entity('tab_invoice_detail')
export class InvoiceDetailOrmEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => InvoiceOrmEntity, (inv) => inv.details, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'invoice_id' })
	invoice: InvoiceOrmEntity;

	// Referencia opcional al catálogo
	@Column({ length: 20, nullable: true })
	item_type: string; // 'ITEM' | 'SERVICE' | 'SUBCONTRACT'

	@Column({ nullable: true })
	item_id: number;

	@Column({ length: 30, nullable: true })
	code: string;

	@Column({ length: 250 })
	description: string;

	@Column('numeric', { precision: 12, scale: 4, default: 1 })
	quantity: number;

	@Column('numeric', { precision: 12, scale: 4, default: 0 })
	unit_price: number;

	@Column('numeric', { precision: 12, scale: 2, default: 0 })
	discount: number;

	@Column('numeric', { precision: 5, scale: 2, default: 15 })
	tax_rate: number; // Tarifa IVA (15%, 5%, 0%)

	@Column('numeric', { precision: 12, scale: 2, default: 0 })
	tax_value: number; // Valor calculado de IVA

	@Column('numeric', { precision: 12, scale: 2, default: 0 })
	subtotal: number; // (quantity * unit_price) - discount

	@Column('numeric', { precision: 12, scale: 2, default: 0 })
	total: number; // subtotal + tax_value
}
