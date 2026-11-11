import { UsersOrmEntity } from 'src/modules/users/infrastructure/persistence/users.orm-entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';

@Entity('tab_company')
export class CompanyOrmEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	ruc: string;

	@Column()
	description: string;

	@Column()
	business_name: string;

	@Column()
	trade_name: string;

	@Column({ default: true })
	enabled: boolean;

	@Column({ default: false })
	deleted: boolean;

	// ===== Datos fiscales SRI =====
	@Column({ type: 'varchar', length: 250, nullable: true })
	address_matriz: string;

	@Column({ type: 'varchar', length: 30, nullable: true })
	phone: string;

	@Column({ type: 'varchar', length: 150, nullable: true })
	email: string;

	@Column({ default: false })
	obligated_accounting: boolean;

	@Column({ type: 'varchar', length: 20, nullable: true })
	special_taxpayer: string; // Nº resolución contribuyente especial

	@Column({ type: 'varchar', length: 60, nullable: true })
	tax_regime: string; // GENERAL | RIMPE_EMPRENDEDOR | RIMPE_NEGOCIO_POPULAR

	@Column({ type: 'varchar', length: 1, default: '1' })
	sri_environment: string; // 1 pruebas, 2 producción

	@Column({ default: false })
	auto_send_sri: boolean; // true = automático al emitir comprobantes, false = manual

	@Column({ type: 'varchar', length: 3, default: '001' })
	default_establishment: string;

	@Column({ type: 'varchar', length: 3, default: '001' })
	default_emission_point: string;

	// ===== Firma electrónica (.p12) =====
	@Column({ type: 'text', nullable: true, select: false })
	cert_p12_base64: string;

	@Column({ type: 'text', nullable: true, select: false })
	cert_password_enc: string;

	@Column({ type: 'varchar', length: 150, nullable: true })
	cert_file_name: string;

	@Column({ type: 'date', nullable: true })
	cert_expires_at: string;

	// ===== Correo saliente (SMTP) =====
	@Column({ type: 'varchar', length: 150, nullable: true })
	smtp_host: string;

	@Column({ type: 'int', nullable: true })
	smtp_port: number;

	@Column({ default: true })
	smtp_secure: boolean;

	@Column({ type: 'varchar', length: 150, nullable: true })
	smtp_user: string;

	@Column({ default: false })
	smtp_has_password: boolean;

	@Column({ type: 'text', nullable: true, select: false })
	smtp_password_enc: string;

	@Column({ type: 'varchar', length: 150, nullable: true })
	smtp_from_name: string;

	@Column({ type: 'varchar', length: 150, nullable: true })
	smtp_from_email: string;

	// Datos del usuario que registra
	@ManyToOne(() => UsersOrmEntity, { nullable: true })
	@JoinColumn({ name: 'created_by' })
	createdBy: UsersOrmEntity;

	@Column({ nullable: true })
	created_name: string;

	@CreateDateColumn({ name: 'created_at' })
	createdAt: Date;

	// Datos del usuario que modifica
	@ManyToOne(() => UsersOrmEntity, { nullable: true })
	@JoinColumn({ name: 'updated_by' })
	updatedBy: UsersOrmEntity;

	@Column({ nullable: true })
	update_name: string;

	@UpdateDateColumn({ name: 'updated_at', nullable: true })
	updatedAt: Date;

	// Datos del usuario que elimina
	@ManyToOne(() => UsersOrmEntity, { nullable: true })
	@JoinColumn({ name: 'deleted_by' })
	deletedBy: UsersOrmEntity;

	@Column({ nullable: true })
	deleted_name: string;

	@DeleteDateColumn({ name: 'deleted_at' })
	deletedAt?: Date;
}