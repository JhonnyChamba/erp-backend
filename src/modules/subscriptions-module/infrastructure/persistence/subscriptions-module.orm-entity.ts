import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ModuleOrmEntity } from 'src/modules/module/infrastructure/persistence/module.orm-entity';
import { subModulesOrmEntity } from 'src/modules/sub-module/infrastructure/persistence/sub-module.orm-entity';
import { SubscriptionsOrmEntity } from 'src/modules/subscriptions/infrastructure/persistence/subscriptions.orm-entity';

@Entity('tab_subscription_module')
export class SubscriptionsModuleOrmEntity {

	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => SubscriptionsOrmEntity, (sub) => sub.subscriptionModules, { nullable: true })
	@JoinColumn({ name: 'subscriptions_id' })
	subscriptions: SubscriptionsOrmEntity;

	@ManyToOne(() => ModuleOrmEntity, { nullable: true })
	@JoinColumn({ name: 'module_id' })
	module: ModuleOrmEntity;

	@ManyToOne(() => subModulesOrmEntity, { nullable: true })
	@JoinColumn({ name: 'sub_module_id' })
	subModule: subModulesOrmEntity;

	@Column({ default: true })
	enabled: boolean;

	@Column({ default: false })
	deleted: boolean;

	@CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
	created_at: Date;
}