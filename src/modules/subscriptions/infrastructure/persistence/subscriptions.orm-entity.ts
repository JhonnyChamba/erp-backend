import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { CompanyOrmEntity } from 'src/modules/company/infrastructure/persistence/company.orm-entity';
import { PlansOrmEntity } from 'src/modules/plans/infrastructure/persistence/plans.orm-entity';
import { UsersOrmEntity } from 'src/modules/users/infrastructure/persistence/users.orm-entity';

@Entity('tab_subscriptions')
export class SubscriptionsOrmEntity {

	@PrimaryGeneratedColumn()
	id: number;

	// Relación con empresa (genera company_id automáticamente)
	@ManyToOne(() => CompanyOrmEntity, { nullable: false })
	@JoinColumn({ name: 'company_id' })
	company: CompanyOrmEntity;

	// Relación con empresa (genera company_id automáticamente)
	@ManyToOne(() => PlansOrmEntity, { nullable: false })
	@JoinColumn({ name: 'plan_id' })
	plan: PlansOrmEntity;

	@Column({ type: 'date' })
	begin_date: Date;

	@Column({ type: 'date' })
	end_date: Date;

	@ManyToOne(() => UsersOrmEntity, { nullable: false })
	@JoinColumn({ name: 'created_by' })
	createdBy: UsersOrmEntity;

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