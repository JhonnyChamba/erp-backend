import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { CompanyOrmEntity } from 'src/modules/company/infrastructure/persistence/company.orm-entity';

/** Campos comunes de clientes, proveedores y vendedores. Todo registro pertenece a una empresa. */
export abstract class ContactBaseOrmEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ name: 'company_id' })
	company_id: number;

	@ManyToOne(() => CompanyOrmEntity, { nullable: false })
	@JoinColumn({ name: 'company_id' })
	company: CompanyOrmEntity;

	// 04 = RUC, 05 = Cédula, 06 = Pasaporte, 07 = Consumidor final (solo clientes)
	@Column({ length: 2 })
	tipo_documento: string;

	@Column({ length: 20 })
	num_document: string;

	@Column({ length: 150, default: '' })
	email: string;

	@Column({ length: 30, default: '' })
	telefono: string;

	@Column({ length: 250, default: '' })
	direccion: string;

	// 'activo' | 'inactivo'
	@Column({ length: 10, default: 'activo' })
	estado: string;

	@Column({ default: false })
	deleted: boolean;

	@Column({ nullable: true })
	created_by: number;

	@CreateDateColumn({ type: 'timestamp' })
	created_at: Date;

	@UpdateDateColumn({ type: 'timestamp' })
	updated_at: Date;
}

// El documento no se repite dentro de una misma empresa (entre registros no eliminados).
@Index(['company_id', 'num_document'], { unique: true, where: '"deleted" = false' })
@Entity('tab_customer')
export class CustomerOrmEntity extends ContactBaseOrmEntity {
	@Column({ length: 200 })
	razon_social: string;

	@Column({ length: 200, nullable: true })
	nombre_comercial: string;

	@Column({ length: 100, nullable: true })
	ciudad: string;
}

@Index(['company_id', 'num_document'], { unique: true, where: '"deleted" = false' })
@Entity('tab_provider')
export class ProviderOrmEntity extends ContactBaseOrmEntity {
	@Column({ length: 200 })
	razon_social: string;

	@Column({ length: 200, nullable: true })
	nombre_comercial: string;

	// contado | credito_15 | credito_30 | credito_60 | transferencia
	@Column({ length: 20, default: 'contado' })
	forma_pago: string;

	@Column({ length: 100, nullable: true })
	banco: string;

	@Column({ length: 40, nullable: true })
	num_cuenta: string;
}

@Index(['company_id', 'num_document'], { unique: true, where: '"deleted" = false' })
@Entity('tab_seller')
export class SellerOrmEntity extends ContactBaseOrmEntity {
	@Column({ length: 120 })
	nombres: string;

	@Column({ length: 120 })
	apellidos: string;

	@Column('numeric', { precision: 5, scale: 2, default: 0 })
	comision_pct: number;
}
