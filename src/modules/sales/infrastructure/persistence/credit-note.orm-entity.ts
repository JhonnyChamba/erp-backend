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
import { InvoiceOrmEntity } from './invoice.orm-entity';

@Index(['company', 'credit_note_number'], { unique: true })
@Entity('tab_credit_note')
export class CreditNoteOrmEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => CompanyOrmEntity, { nullable: false, onDelete: 'CASCADE' })
	@JoinColumn({ name: 'company_id' })
	company: CompanyOrmEntity;

	@ManyToOne(() => InvoiceOrmEntity, { nullable: true, onDelete: 'SET NULL' })
	@JoinColumn({ name: 'invoice_id' })
	invoice: InvoiceOrmEntity | null;

	@Column({ type: 'int', nullable: true })
	branch_id: number | null;

	@Column({ type: 'varchar', length: 300, nullable: true })
	branch_address: string | null;

	// Secuencial SRI Ecuador: Ej: 001-001-000000001
	@Column({ length: 3, default: '001' })
	establishment: string;

	@Column({ length: 3, default: '001' })
	emission_point: string;

	@Column({ length: 9 })
	sequential: string;

	@Column({ length: 25 })
	credit_note_number: string; // 001-001-000000001

	@Column({ type: 'date' })
	issue_date: string;

	// Documento sustento modificado (SRI Ecuador: 01 = Factura)
	@Column({ length: 2, default: '01' })
	modified_document_type: string;

	@Column({ length: 25 })
	modified_document_number: string; // 001-001-000000001

	@Column({ type: 'date', nullable: true })
	modified_document_date: string;

	// Motivo de la modificación (obligatorio según SRI, máx 300 caracteres)
	@Column({ length: 300 })
	reason: string;

	// Cliente (Normativa SRI)
	@Column({ length: 2, default: '05' })
	customer_id_type: string;

	@Column({ length: 20 })
	customer_id_number: string;

	@Column({ length: 200 })
	customer_name: string;

	@Column({ length: 200, nullable: true })
	customer_address: string;

	@Column({ length: 100, nullable: true })
	customer_email: string;

	@Column({ length: 25, nullable: true })
	customer_phone: string;

	// Clave de Acceso SRI (49 dígitos numéricos, tipo 04)
	@Column({ length: 49, nullable: true })
	access_key: string;

	// Estado: DRAFT, ISSUED, AUTHORIZED, CANCELED
	@Column({ length: 20, default: 'ISSUED' })
	status: string;

	// Valores monetarios
	@Column('numeric', { precision: 12, scale: 2, default: 0 })
	subtotal_zero_tax: number;

	@Column('numeric', { precision: 12, scale: 2, default: 0 })
	subtotal_taxable: number;

	@Column('numeric', { precision: 12, scale: 2, default: 0 })
	subtotal: number;

	@Column('numeric', { precision: 12, scale: 2, default: 0 })
	discount_total: number;

	@Column('numeric', { precision: 12, scale: 2, default: 0 })
	tax_total: number;

	@Column('numeric', { precision: 12, scale: 2, default: 0 })
	total: number;

	// Si se debe reingresar inventario (devolución física)
	@Column({ default: true })
	adjust_inventory: boolean;

	@Column({ type: 'text', nullable: true })
	notes: string;

	// XML firmado (XAdES-BES)
	@Column({ type: 'text', nullable: true, select: false })
	signed_xml: string;

	@Column({ type: 'timestamp', nullable: true })
	signed_at: Date;

	@Column({ type: 'varchar', length: 20, default: 'NOT_SIGNED' })
	sign_status: string;

	// SRI Status
	@Column({ type: 'varchar', length: 20, default: 'NOT_SENT' })
	sri_status: string;

	@Column({ type: 'varchar', length: 49, nullable: true })
	sri_authorization_number: string | null;

	@Column({ type: 'timestamp', nullable: true })
	sri_authorization_date: Date | null;

	@Column({ type: 'timestamp', nullable: true })
	sri_sent_at: Date | null;

	@Column({ type: 'jsonb', nullable: true })
	sri_messages: Array<{ identificador: string; mensaje: string; informacionAdicional?: string; tipo?: string }> | null;

	@Column({ type: 'text', nullable: true, select: false })
	sri_response_xml: string | null;

	@Column({ nullable: true })
	created_by: number;

	@Column({ default: true })
	enabled: boolean;

	@Column({ default: false })
	deleted: boolean;

	@OneToMany(() => CreditNoteDetailOrmEntity, (d) => d.credit_note, { cascade: true })
	details: CreditNoteDetailOrmEntity[];

	@CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
	created_at: Date;

	@UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
	updated_at: Date;
}

@Entity('tab_credit_note_detail')
export class CreditNoteDetailOrmEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => CreditNoteOrmEntity, (cn) => cn.details, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'credit_note_id' })
	credit_note: CreditNoteOrmEntity;

	@Column({ length: 20, default: 'PRODUCT' })
	item_type: string;

	@Column({ nullable: true })
	item_id: number;

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
	tax_rate: number;

	@Column('numeric', { precision: 12, scale: 2, default: 0 })
	tax_value: number;

	@Column('numeric', { precision: 12, scale: 2, default: 0 })
	subtotal: number;

	@Column('numeric', { precision: 12, scale: 2, default: 0 })
	total: number;
}

