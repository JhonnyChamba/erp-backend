import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ModuleOrmEntity } from 'src/modules/module/infrastructure/persistence/module.orm-entity';
import { SubscriptionsOrmEntity } from 'src/modules/subscriptions/infrastructure/persistence/subscriptions.orm-entity';

@Entity('tab_subscription_module')
export class SubscriptionsModuleOrmEntity {

	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => SubscriptionsOrmEntity, { nullable: true }) // <- relación
	@JoinColumn({ name: 'subscriptions_id' })
	subscriptions: SubscriptionsOrmEntity;

	@ManyToOne(() => ModuleOrmEntity, { nullable: true }) // <- relación
	@JoinColumn({ name: 'module_id' })
	module: ModuleOrmEntity;

	@CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
	created_at: Date;
}