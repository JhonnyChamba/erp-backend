import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne,
	JoinColumn,
	OneToMany,
} from 'typeorm';
import { CompanyOrmEntity } from 'src/modules/company/infrastructure/persistence/company.orm-entity';
import { BranchCompanyOrmEntity } from 'src/modules/branch-company/infrastructure/persistence/branch-company.orm-entity';
import { CustomerOrmEntity } from 'src/modules/contacts/infrastructure/persistence/contacts.orm-entity';
import { EmployeeOrmEntity } from 'src/modules/human-resources/infrastructure/persistence/employee.orm-entity';
import { AppointmentItemOrmEntity } from './appointment-item.orm-entity';

@Entity('tab_appointments')
export class AppointmentOrmEntity {
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

	@Column({ name: 'customer_id', type: 'int' })
	customer_id: number;

	@ManyToOne(() => CustomerOrmEntity, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'customer_id' })
	customer: CustomerOrmEntity;

	@Column({ name: 'employee_id', type: 'int' })
	employee_id: number;

	@ManyToOne(() => EmployeeOrmEntity, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'employee_id' })
	employee: EmployeeOrmEntity;

	@Column({ name: 'order_number', type: 'varchar', length: 30, unique: true })
	order_number: string;

	@Column({ name: 'appointment_date', type: 'date' })
	appointment_date: string;

	@Column({ name: 'start_time', type: 'time' })
	start_time: string;

	@Column({ name: 'end_time', type: 'time' })
	end_time: string;

	@Column({ name: 'status', type: 'varchar', length: 20, default: 'PROGRAMADA' })
	status: string; // PROGRAMADA, CONFIRMADA, EN_ATENCION, FINALIZADA, FACTURADA, CANCELADA, NO_ASISTIO

	@Column({
		name: 'subtotal',
		type: 'decimal',
		precision: 10,
		scale: 2,
		default: 0.0,
		transformer: {
			to: (value: number) => value,
			from: (value: string | null) => (value !== null ? parseFloat(value) : 0),
		},
	})
	subtotal: number;

	@Column({
		name: 'tax_amount',
		type: 'decimal',
		precision: 10,
		scale: 2,
		default: 0.0,
		transformer: {
			to: (value: number) => value,
			from: (value: string | null) => (value !== null ? parseFloat(value) : 0),
		},
	})
	tax_amount: number;

	@Column({
		name: 'total_estimated',
		type: 'decimal',
		precision: 10,
		scale: 2,
		default: 0.0,
		transformer: {
			to: (value: number) => value,
			from: (value: string | null) => (value !== null ? parseFloat(value) : 0),
		},
	})
	total_estimated: number;

	@Column({ name: 'notes', type: 'text', nullable: true })
	notes: string | null;

	@Column({ name: 'invoice_id', type: 'int', nullable: true })
	invoice_id: number | null;

	@Column({ name: 'deleted', type: 'boolean', default: false })
	deleted: boolean;

	@OneToMany(() => AppointmentItemOrmEntity, (item) => item.appointment, { cascade: true })
	items: AppointmentItemOrmEntity[];

	@CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
	created_at: Date;

	@UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
	updated_at: Date;
}

