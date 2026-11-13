import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne,
	JoinColumn,
} from 'typeorm';
import { CompanyOrmEntity } from 'src/modules/company/infrastructure/persistence/company.orm-entity';
import { BranchCompanyOrmEntity } from 'src/modules/branch-company/infrastructure/persistence/branch-company.orm-entity';
import { EmployeeCategoryOrmEntity } from './employee-category.orm-entity';
import { UsersOrmEntity } from 'src/modules/users/infrastructure/persistence/users.orm-entity';

@Entity('tab_employees')
export class EmployeeOrmEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ name: 'company_id', type: 'int' })
	company_id: number;

	@ManyToOne(() => CompanyOrmEntity, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'company_id' })
	company: CompanyOrmEntity;

	@Column({ name: 'branch_id', type: 'int', nullable: true })
	branch_id: number | null;

	@ManyToOne(() => BranchCompanyOrmEntity, { nullable: true, onDelete: 'SET NULL' })
	@JoinColumn({ name: 'branch_id' })
	branch: BranchCompanyOrmEntity | null;

	@Column({ name: 'category_id', type: 'int', nullable: true })
	category_id: number | null;

	@ManyToOne(() => EmployeeCategoryOrmEntity, { nullable: true, onDelete: 'SET NULL' })
	@JoinColumn({ name: 'category_id' })
	category: EmployeeCategoryOrmEntity | null;

	@Column({ name: 'user_id', type: 'int', nullable: true })
	user_id: number | null;

	@ManyToOne(() => UsersOrmEntity, { nullable: true, onDelete: 'SET NULL' })
	@JoinColumn({ name: 'user_id' })
	user: UsersOrmEntity | null;

	// Datos Personales
	@Column({ name: 'first_name', type: 'varchar', length: 100 })
	first_name: string;

	@Column({ name: 'last_name', type: 'varchar', length: 100 })
	last_name: string;

	@Column({ name: 'id_type', type: 'varchar', length: 10, default: '05' })
	id_type: string;

	@Column({ name: 'id_number', type: 'varchar', length: 30 })
	id_number: string;

	@Column({ name: 'birth_date', type: 'date', nullable: true })
	birth_date: string | null;

	@Column({ name: 'gender', type: 'varchar', length: 20, nullable: true })
	gender: string | null;

	@Column({ name: 'phone', type: 'varchar', length: 30, nullable: true })
	phone: string | null;

	@Column({ name: 'email', type: 'varchar', length: 150, nullable: true })
	email: string | null;

	@Column({ name: 'address', type: 'text', nullable: true })
	address: string | null;

	@Column({ name: 'photo_url', type: 'text', nullable: true })
	photo_url: string | null;

	// Datos Laborales y Nómina
	@Column({ name: 'hire_date', type: 'date', default: () => 'CURRENT_DATE' })
	hire_date: string;

	@Column({ name: 'contract_type', type: 'varchar', length: 50, default: 'INDEFINIDO' })
	contract_type: string;

	@Column({
		name: 'base_salary',
		type: 'decimal',
		precision: 10,
		scale: 2,
		default: 0.00,
		transformer: {
			to: (value: number) => value,
			from: (value: string | null) => (value !== null ? parseFloat(value) : 0),
		},
	})
	base_salary: number;

	@Column({ name: 'payment_frequency', type: 'varchar', length: 20, default: 'MENSUAL' })
	payment_frequency: string;

	@Column({ name: 'bank_name', type: 'varchar', length: 100, nullable: true })
	bank_name: string | null;

	@Column({ name: 'bank_account_type', type: 'varchar', length: 20, nullable: true })
	bank_account_type: string | null;

	@Column({ name: 'bank_account_number', type: 'varchar', length: 50, nullable: true })
	bank_account_number: string | null;

	@Column({ name: 'iess_affiliation_code', type: 'varchar', length: 30, nullable: true })
	iess_affiliation_code: string | null;

	// Configuración para Agendamiento / Spa
	@Column({ name: 'accepts_appointments', type: 'boolean', default: false })
	accepts_appointments: boolean;

	@Column({ name: 'calendar_color', type: 'varchar', length: 20, default: '#0085db' })
	calendar_color: string;

	@Column({
		name: 'commission_rate',
		type: 'decimal',
		precision: 5,
		scale: 2,
		default: 0.00,
		transformer: {
			to: (value: number) => value,
			from: (value: string | null) => (value !== null ? parseFloat(value) : 0),
		},
	})
	commission_rate: number;

	@Column({ name: 'status', type: 'varchar', length: 20, default: 'ACTIVO' })
	status: string;

	@Column({ name: 'deleted', type: 'boolean', default: false })
	deleted: boolean;

	@CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
	created_at: Date;

	@UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
	updated_at: Date;
}
