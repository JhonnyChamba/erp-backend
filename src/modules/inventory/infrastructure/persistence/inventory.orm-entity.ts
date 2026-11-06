import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	ManyToOne,
	JoinColumn,
} from 'typeorm';
import { CompanyOrmEntity } from 'src/modules/company/infrastructure/persistence/company.orm-entity';

/**
 * 1. TABLA DE ÍTEMS / ARTÍCULOS FÍSICOS (tab_inventory_item)
 */
@Entity('tab_inventory_item')
export class InventoryItemOrmEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ length: 25 })
	code: string;

	@Column({ length: 60, nullable: true })
	sku: string;

	@Column({ length: 180 })
	name: string;

	@Column({ length: 100, default: 'General' })
	category: string;

	@Column({ length: 50, default: 'Unidad' })
	unit_measure: string;

	@Column('numeric', { precision: 12, scale: 2, default: 0 })
	cost_price: number;

	@Column('numeric', { precision: 12, scale: 2, default: 0 })
	sale_price: number;

	@Column('numeric', { precision: 5, scale: 2, default: 15 })
	tax_rate: number;

	@Column('numeric', { precision: 12, scale: 2, default: 0 })
	stock_current: number;

	@Column('numeric', { precision: 12, scale: 2, default: 0 })
	stock_min: number;

	@Column({ length: 120, nullable: true })
	warehouse_location: string;

	@Column({ type: 'text', nullable: true })
	description: string;

	@ManyToOne(() => CompanyOrmEntity, { nullable: true })
	@JoinColumn({ name: 'company_id' })
	company: CompanyOrmEntity;

	@Column({ nullable: true })
	created_by: number;

	@Column({ default: true })
	enabled: boolean;

	@Column({ default: false })
	deleted: boolean;

	@CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
	created_at: Date;
}

/**
 * 2. TABLA DE SERVICIOS PROPIOS (tab_inventory_service)
 */
@Entity('tab_inventory_service')
export class InventoryServiceOrmEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ length: 25 })
	code: string;

	@Column({ length: 180 })
	name: string;

	@Column({ length: 100, default: 'Servicios Generales' })
	category: string;

	@Column({ length: 50, default: 'Servicio' })
	billing_unit: string;

	@Column('numeric', { precision: 12, scale: 2, default: 0 })
	base_cost: number;

	@Column('numeric', { precision: 12, scale: 2, default: 0 })
	sale_price: number;

	@Column('numeric', { precision: 5, scale: 2, default: 15 })
	tax_rate: number;

	@Column({ length: 80, nullable: true })
	estimated_duration: string;

	@Column({ type: 'text', nullable: true })
	description: string;

	@ManyToOne(() => CompanyOrmEntity, { nullable: true })
	@JoinColumn({ name: 'company_id' })
	company: CompanyOrmEntity;

	@Column({ nullable: true })
	created_by: number;

	@Column({ default: true })
	enabled: boolean;

	@Column({ default: false })
	deleted: boolean;

	@CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
	created_at: Date;
}

/**
 * 3. TABLA DE SERVICIOS DE SUBCONTRATACIÓN / MANO DE OBRA (tab_inventory_subcontract)
 */
@Entity('tab_inventory_subcontract')
export class InventorySubcontractOrmEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ length: 25 })
	code: string;

	@Column({ length: 180 })
	name: string;

	@Column({ length: 100, default: 'Mano de Obra' })
	specialty_area: string;

	@Column({ length: 160, nullable: true })
	contractor_name: string;

	@Column({ length: 25, nullable: true })
	contractor_ruc: string;

	@Column({ length: 50, default: 'Hora Hombre' })
	unit_measure: string;

	@Column('numeric', { precision: 12, scale: 2, default: 0 })
	unit_cost: number;

	@Column('numeric', { precision: 12, scale: 2, default: 0 })
	suggested_price: number;

	@Column('numeric', { precision: 5, scale: 2, default: 15 })
	tax_rate: number;

	@Column({ default: false })
	includes_materials: boolean;

	@Column({ type: 'text', nullable: true })
	description: string;

	@ManyToOne(() => CompanyOrmEntity, { nullable: true })
	@JoinColumn({ name: 'company_id' })
	company: CompanyOrmEntity;

	@Column({ nullable: true })
	created_by: number;

	@Column({ default: true })
	enabled: boolean;

	@Column({ default: false })
	deleted: boolean;

	@CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
	created_at: Date;
}
