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
import { EmployeeOrmEntity } from 'src/modules/human-resources/infrastructure/persistence/employee.orm-entity';

@Entity('tab_employee_schedules')
export class EmployeeScheduleOrmEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ name: 'company_id', type: 'int' })
	company_id: number;

	@ManyToOne(() => CompanyOrmEntity, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'company_id' })
	company: CompanyOrmEntity;

	@Column({ name: 'employee_id', type: 'int' })
	employee_id: number;

	@ManyToOne(() => EmployeeOrmEntity, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'employee_id' })
	employee: EmployeeOrmEntity;

	@Column({ name: 'day_of_week', type: 'int' })
	day_of_week: number; // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado

	@Column({ name: 'start_time', type: 'time', default: '09:00:00' })
	start_time: string;

	@Column({ name: 'end_time', type: 'time', default: '19:00:00' })
	end_time: string;

	@Column({ name: 'break_start', type: 'time', nullable: true, default: '13:00:00' })
	break_start: string | null;

	@Column({ name: 'break_end', type: 'time', nullable: true, default: '14:00:00' })
	break_end: string | null;

	@Column({ name: 'active', type: 'boolean', default: true })
	active: boolean;

	@CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
	created_at: Date;

	@UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
	updated_at: Date;
}

