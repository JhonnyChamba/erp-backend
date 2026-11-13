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

@Entity('tab_employee_categories')
export class EmployeeCategoryOrmEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ name: 'company_id', type: 'int' })
	company_id: number;

	@ManyToOne(() => CompanyOrmEntity, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'company_id' })
	company: CompanyOrmEntity;

	@Column({ type: 'varchar', length: 100 })
	name: string;

	@Column({ type: 'text', nullable: true })
	description: string;

	@Column({
		name: 'default_commission_rate',
		type: 'decimal',
		precision: 5,
		scale: 2,
		default: 0.00,
		transformer: {
			to: (value: number) => value,
			from: (value: string | null) => (value !== null ? parseFloat(value) : 0),
		},
	})
	default_commission_rate: number;

	@Column({ type: 'boolean', default: true })
	active: boolean;

	@Column({ type: 'boolean', default: false })
	deleted: boolean;

	@CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
	created_at: Date;

	@UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
	updated_at: Date;
}

