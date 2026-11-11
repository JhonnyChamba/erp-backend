import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { CompanyOrmEntity } from '../../../company/infrastructure/persistence/company.orm-entity';

/**
 * 1. TABLA DE ÍTEMS / ARTÍCULOS FÍSICOS (tab_inventory_item) - Legado / Compatibilidad
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

	@Column({ nullable: true })
	category_id: number;

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

	@Column({ nullable: true })
	warehouse_id: number;

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

/**
 * 4. TABLA DE CATEGORÍAS DE INVENTARIO (tab_inventory_category / tab_product_categories)
 */
@Index(['company', 'code'])
@Entity('tab_inventory_category')
export class InventoryCategoryOrmEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ length: 50 })
	code: string;

	@Column({ length: 150 })
	name: string;

	// Tipo de categoría: 'PRODUCT' | 'SERVICE' | 'LABOR' | 'ALL'
	@Column({ length: 20, default: 'ALL' })
	category_type: string;

	@Column({ type: 'varchar', length: 500, nullable: true })
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

	@CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
	created_at: Date;

	@UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
	updated_at: Date;
}

export { InventoryCategoryOrmEntity as ProductCategoryOrmEntity };

/**
 * 5. TABLA DE BODEGAS / ALMACENES (tab_inventory_warehouse / tab_warehouses)
 */
@Index(['company', 'code'])
@Entity('tab_inventory_warehouse')
export class InventoryWarehouseOrmEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ length: 50 })
	code: string;

	@Column({ length: 150 })
	name: string;

	@Column({ type: 'varchar', length: 500, nullable: true })
	description: string;

	@Column({ length: 255, nullable: true })
	address: string;

	@Column({ length: 150, nullable: true })
	responsible: string;

	@Column({ length: 50, nullable: true })
	phone: string;

	@Column({ nullable: true })
	branch_id: number;

	@Column({ default: false })
	is_default: boolean;

	@ManyToOne(() => CompanyOrmEntity, { nullable: true })
	@JoinColumn({ name: 'company_id' })
	company: CompanyOrmEntity;

	@Column({ nullable: true })
	created_by: number;

	@Column({ default: true })
	enabled: boolean;

	@Column({ default: false })
	deleted: boolean;

	@CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
	created_at: Date;

	@UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
	updated_at: Date;
}

export { InventoryWarehouseOrmEntity as WarehouseOrmEntity };

/**
 * 6. TABLA UNIFICADA DE ARTÍCULOS / PRODUCTOS / SERVICIOS / MANO DE OBRA (tab_items)
 * Catálogo central de todos los conceptos (PRODUCT, SERVICE, LABOR)
 */
@Index(['company', 'code'])
@Entity('tab_items')
export class ItemOrmEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => CompanyOrmEntity, { nullable: false })
	@JoinColumn({ name: 'company_id' })
	company: CompanyOrmEntity;

	@Column({ length: 100 })
	code: string;

	@Column({ length: 100, nullable: true })
	sku: string;

	@Column({ length: 250 })
	name: string;

	@Column({ type: 'text', nullable: true })
	description: string;

	// 'PRODUCT' | 'SERVICE' | 'LABOR'
	@Column({ length: 20, default: 'PRODUCT' })
	item_type: string;

	@ManyToOne(() => InventoryCategoryOrmEntity, { nullable: true })
	@JoinColumn({ name: 'product_category_id' })
	category: InventoryCategoryOrmEntity;

	@Column({ nullable: true })
	product_category_id: number;

	@Column({ length: 150, nullable: true })
	category_name: string;

	@Column({ length: 50, default: 'UND' })
	unit_measure: string;

	@Column('numeric', { precision: 18, scale: 6, default: 0 })
	sale_price: number;

	@Column('numeric', { precision: 18, scale: 6, default: 0 })
	purchase_price: number;

	@Column('numeric', { precision: 5, scale: 2, default: 15 })
	tax_rate: number;

	@Column({ default: true })
	ind_active: boolean;

	@Column({ default: false })
	deleted: boolean;

	@CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
	created_at: Date;

	@UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
	updated_at: Date;
}

/**
 * 7. TABLA DE SALDOS DE INVENTARIO EN TIEMPO REAL (tab_inventory_balances)
 * Mantiene el saldo actual por producto y por bodega.
 */
@Index(['company', 'warehouse', 'product'], { unique: true })
@Entity('tab_inventory_balances')
export class InventoryBalanceOrmEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => CompanyOrmEntity, { nullable: false })
	@JoinColumn({ name: 'company_id' })
	company: CompanyOrmEntity;

	@ManyToOne(() => InventoryWarehouseOrmEntity, { nullable: false })
	@JoinColumn({ name: 'warehouse_id' })
	warehouse: InventoryWarehouseOrmEntity;

	@ManyToOne(() => ItemOrmEntity, { nullable: false })
	@JoinColumn({ name: 'product_id' })
	product: ItemOrmEntity;

	@Column('numeric', { precision: 18, scale: 6, default: 0 })
	stock: number;

	@Column('numeric', { precision: 18, scale: 6, default: 0 })
	reserved_stock: number;

	@Column('numeric', { precision: 18, scale: 6, default: 0 })
	average_cost: number;

	@CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
	created_at: Date;

	@UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
	updated_at: Date;
}

/**
 * 8. TABLA DE MOVIMIENTOS HISTÓRICOS / KARDEX INMUTABLE (tab_inventory_movements)
 * Registros confirmados e inmutables de todo movimiento de inventario.
 */
@Index(['company', 'product'])
@Index(['company', 'warehouse'])
@Index(['idempotency_key'])
@Entity('tab_inventory_movements')
export class InventoryMovementOrmEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => CompanyOrmEntity, { nullable: false })
	@JoinColumn({ name: 'company_id' })
	company: CompanyOrmEntity;

	@ManyToOne(() => InventoryWarehouseOrmEntity, { nullable: false })
	@JoinColumn({ name: 'warehouse_id' })
	warehouse: InventoryWarehouseOrmEntity;

	@ManyToOne(() => ItemOrmEntity, { nullable: false })
	@JoinColumn({ name: 'product_id' })
	product: ItemOrmEntity;

	@Column({ length: 100 })
	product_code: string;

	@Column({ length: 250 })
	product_name: string;

	// 'IN' | 'OUT'
	@Column({ length: 10 })
	movement_type: string;

	// 'OPENING' | 'PURCHASE' | 'SALE' | 'CUSTOMER_RETURN' | 'SUPPLIER_RETURN' | 'ADJUSTMENT' | 'TRANSFER' | 'REVERSAL'
	@Column({ length: 30 })
	movement_reason: string;

	// Cantidad con signo: positiva en entrada, negativa en salida
	@Column('numeric', { precision: 18, scale: 6 })
	quantity: number;

	@Column('numeric', { precision: 18, scale: 6, default: 0 })
	unit_cost: number;

	@Column('numeric', { precision: 18, scale: 6, default: 0 })
	total_cost: number;

	@Column('numeric', { precision: 18, scale: 6 })
	stock_after: number;

	@Column({ length: 100, nullable: true })
	collection_origin_id: string;

	@Column({ length: 100, nullable: true })
	collection_origin_name: string;

	@Column({ length: 100, nullable: true })
	collection_origin_document: string;

	@Column({ length: 100, nullable: true })
	movement_group_id: string;

	@Column({ length: 150, nullable: true })
	idempotency_key: string;

	@Column({ nullable: true })
	reversal_of_movement_id: number;

	@Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
	movement_at: Date;

	@Column({ nullable: true })
	created_user_id: number;

	@CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
	created_at: Date;
}

