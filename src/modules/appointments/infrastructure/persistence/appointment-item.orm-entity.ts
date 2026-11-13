import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	ManyToOne,
	JoinColumn,
} from 'typeorm';
import { AppointmentOrmEntity } from './appointment.orm-entity';
import { InventoryServiceOrmEntity } from 'src/modules/inventory/infrastructure/persistence/inventory.orm-entity';

@Entity('tab_appointment_items')
export class AppointmentItemOrmEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ name: 'appointment_id', type: 'int' })
	appointment_id: number;

	@ManyToOne(() => AppointmentOrmEntity, (apt) => apt.items, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'appointment_id' })
	appointment: AppointmentOrmEntity;

	@Column({ name: 'service_id', type: 'int', nullable: true })
	service_id: number | null;

	@ManyToOne(() => InventoryServiceOrmEntity, { nullable: true, onDelete: 'SET NULL' })
	@JoinColumn({ name: 'service_id' })
	service: InventoryServiceOrmEntity | null;

	@Column({ name: 'service_name', type: 'varchar', length: 200 })
	service_name: string;

	@Column({ name: 'duration_minutes', type: 'int', default: 30 })
	duration_minutes: number;

	@Column({
		name: 'price',
		type: 'decimal',
		precision: 10,
		scale: 2,
		default: 0.0,
		transformer: {
			to: (value: number) => value,
			from: (value: string | null) => (value !== null ? parseFloat(value) : 0),
		},
	})
	price: number;

	@Column({
		name: 'tax_rate',
		type: 'decimal',
		precision: 5,
		scale: 2,
		default: 15.0,
		transformer: {
			to: (value: number) => value,
			from: (value: string | null) => (value !== null ? parseFloat(value) : 15.0),
		},
	})
	tax_rate: number;

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
		name: 'total',
		type: 'decimal',
		precision: 10,
		scale: 2,
		default: 0.0,
		transformer: {
			to: (value: number) => value,
			from: (value: string | null) => (value !== null ? parseFloat(value) : 0),
		},
	})
	total: number;

	@Column({ name: 'notes', type: 'text', nullable: true })
	notes: string | null;
}

