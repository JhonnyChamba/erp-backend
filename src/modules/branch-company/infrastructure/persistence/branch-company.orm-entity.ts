import { CompanyOrmEntity } from 'src/modules/company/infrastructure/persistence/company.orm-entity';
import { UsersOrmEntity } from 'src/modules/users/infrastructure/persistence/users.orm-entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';

// Garantiza en la base de datos que una empresa no puede tener dos sucursales matriz (ni por concurrencia)
@Index('UQ_branch_company_one_matrix', ['company'], { unique: true, where: '"is_matrix" = true AND "deleted" = false' })
@Entity('tab_branch_company')
export class BranchCompanyOrmEntity {

	@PrimaryGeneratedColumn()
	id: number;

	@Column({ length: 20 })
	code: string;

	@Column({ length: 150 })
	name: string;

	// Dirección del establecimiento (va en el XML del SRI como dirEstablecimiento, máx. 300 caracteres)
	@Column({ length: 300 })
	address: string;

	// Punto de emisión por defecto de la sucursal (3 dígitos). Con el código forma el número: 001-001-000000001
	@Column({ length: 3, default: '001' })
	emission_point: string;

	@Column({ length: 30, nullable: true })
	phone: string | null;

	@Column({ length: 150, nullable: true })
	email: string | null;

	// Establecimiento matriz de la empresa (solo uno por empresa)
	@Column({ default: false })
	is_matrix: boolean;

	// Relación con empresa (genera company_id automáticamente)
	@ManyToOne(() => CompanyOrmEntity, { nullable: false })
	@JoinColumn({ name: 'company_id' })
	company: CompanyOrmEntity;

	// Usuario creador
	@Column({ nullable: true })
	created_by: number;

	@Column({ default: true })
	enabled: boolean;

	@Column({ default: false })
	deleted: boolean;

	@CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
	created_at: Date;
}