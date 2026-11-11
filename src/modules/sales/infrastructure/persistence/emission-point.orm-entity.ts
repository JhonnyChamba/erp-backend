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
import { BranchCompanyOrmEntity } from 'src/modules/branch-company/infrastructure/persistence/branch-company.orm-entity';

@Index(['company', 'branch', 'serie'], { unique: true })
@Entity('tab_emission_point')
export class EmissionPointOrmEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => CompanyOrmEntity, { nullable: false, onDelete: 'CASCADE' })
	@JoinColumn({ name: 'company_id' })
	company: CompanyOrmEntity;

	@ManyToOne(() => BranchCompanyOrmEntity, { nullable: false, onDelete: 'CASCADE' })
	@JoinColumn({ name: 'branch_id' })
	branch: BranchCompanyOrmEntity;

	@Column({ length: 150 })
	description: string;

	// Serie del punto de emisión (3 dígitos SRI, ej: 001, 002, 856)
	@Column({ length: 10 })
	serie: string;

	@Column({ default: true })
	enabled: boolean;

	@Column({ default: false })
	deleted: boolean;

	@Column({ type: 'int', nullable: true })
	created_by: number | null;

	@OneToMany(() => EmissionPointSequenceOrmEntity, (s) => s.emission_point, { cascade: true })
	sequences: EmissionPointSequenceOrmEntity[];

	@CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
	created_at: Date;

	@UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
	updated_at: Date;
}

@Index(['emission_point', 'document_type'], { unique: true })
@Entity('tab_emission_point_sequence')
export class EmissionPointSequenceOrmEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => CompanyOrmEntity, { nullable: false, onDelete: 'CASCADE' })
	@JoinColumn({ name: 'company_id' })
	company: CompanyOrmEntity;

	@ManyToOne(() => EmissionPointOrmEntity, (p) => p.sequences, { nullable: false, onDelete: 'CASCADE' })
	@JoinColumn({ name: 'emission_point_id' })
	emission_point: EmissionPointOrmEntity;

	// FACTURAS, NOTAS DE CRÉDITO, GUÍAS DE REMISIÓN, NOTAS DE DÉBITO
	@Column({ length: 50 })
	document_type: string;

	// Código SRI: 01, 04, 06, 05
	@Column({ length: 10 })
	document_code: string;

	// Copia de la serie del punto emisor
	@Column({ length: 10 })
	serie: string;

	// Último número secuencial emitido (correlativo)
	@Column({ type: 'int', default: 0 })
	correlative: number;

	@Column({ default: true })
	enabled: boolean;

	@CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
	created_at: Date;

	@UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
	updated_at: Date;
}

