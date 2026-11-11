import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	ManyToOne,
	OneToMany,
	JoinColumn,
	Index,
} from 'typeorm';
import { CompanyOrmEntity } from 'src/modules/company/infrastructure/persistence/company.orm-entity';

// El número de factura es único POR EMPRESA (dos empresas pueden tener 001-001-000000001).
@Index(['company', 'invoice_number'], { unique: true })
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

	// Sucursal con la que se emitió y la dirección del establecimiento al momento de emitir (dirEstablecimiento del SRI)
	@Column({ type: 'int', nullable: true })
	branch_id: number | null;

	@Column({ type: 'varchar', length: 300, nullable: true })
	branch_address: string | null;

	// Bodega predeterminada de despacho para la factura
	@Column({ type: 'int', nullable: true })
	warehouse_id: number | null;

	@Column({ length: 9 })
	sequential: string; // 9 dígitos secuenciales

	@Column({ length: 25 })
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

	// XML firmado (XAdES-BES) listo para enviar al SRI
	@Column({ type: 'text', nullable: true, select: false })
	signed_xml: string;

	@Column({ type: 'timestamp', nullable: true })
	signed_at: Date;

	@Column({ type: 'varchar', length: 20, default: 'NOT_SIGNED' })
	sign_status: string; // NOT_SIGNED | SIGNED

	// Resultado del envío al SRI.
	// NOT_SENT | RETURNED (recepción DEVUELTA) | IN_PROCESS (recibida, sin autorización aún) | AUTHORIZED | NOT_AUTHORIZED
	@Column({ type: 'varchar', length: 20, default: 'NOT_SENT' })
	sri_status: string;

	@Column({ type: 'varchar', length: 49, nullable: true })
	sri_authorization_number: string | null;

	@Column({ type: 'timestamp', nullable: true })
	sri_authorization_date: Date | null;

	@Column({ type: 'timestamp', nullable: true })
	sri_sent_at: Date | null;

	// Mensajes devueltos por el SRI (motivos de rechazo o advertencias): [{ identificador, mensaje, informacionAdicional, tipo }]
	@Column({ type: 'jsonb', nullable: true })
	sri_messages: Array<{ identificador: string; mensaje: string; informacionAdicional?: string; tipo?: string }> | null;

	// Última respuesta SOAP completa del SRI, por trazabilidad (no se devuelve en los listados).
	@Column({ type: 'text', nullable: true, select: false })
	sri_response_xml: string | null;

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
	item_type: string; // 'PRODUCT' | 'SERVICE' | 'LABOR' | 'ITEM'

	@Column({ nullable: true })
	item_id: number;

	// Bodega de donde se despacha el producto específico en esta fila
	@Column({ type: 'int', nullable: true })
	warehouse_id: number | null;

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

