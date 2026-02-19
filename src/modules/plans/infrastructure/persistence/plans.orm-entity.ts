import { BillingCycleGeneral } from 'src/common/enum/enum';
import { UsersOrmEntity } from 'src/modules/users/infrastructure/persistence/users.orm-entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';

@Entity('tab_plans')
export class PlansOrmEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ type: 'numeric', precision: 10, scale: 2 })
	price: string;

	@Column({ type: 'enum', enum: BillingCycleGeneral, default: BillingCycleGeneral.MONTHLY })
	billing_cycle: BillingCycleGeneral;

	@Column()
	description: string;

	@Column()
	max_users: number;

	@Column()
	max_branches: number;

	@Column({ default: true })
	enabled: boolean;

	// Datos del usuario que registra
	@ManyToOne(() => UsersOrmEntity, { nullable: true })
	@JoinColumn({ name: 'created_by' })
	createdBy: UsersOrmEntity;

	@Column({ nullable: true })
	created_name: string;

	@CreateDateColumn({ name: 'created_at' })
	createdAt: Date;

	// Datos del usuario que modifica
	@ManyToOne(() => UsersOrmEntity, { nullable: true })
	@JoinColumn({ name: 'updated_by' })
	updatedBy: UsersOrmEntity;

	@Column({ nullable: true })
	update_name: string;

	@UpdateDateColumn({ name: 'updated_at', nullable: true })
	updatedAt: Date;
}