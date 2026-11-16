import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ModuleOrmEntity } from 'src/modules/module/infrastructure/persistence/module.orm-entity';
import { subModulesOrmEntity } from 'src/modules/sub-module/infrastructure/persistence/sub-module.orm-entity';
import { PlansOrmEntity } from 'src/modules/plans/infrastructure/persistence/plans.orm-entity';

@Entity('tab_plans_module')
export class PlansModulesOrmEntity {

	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => PlansOrmEntity, { nullable: true })
	@JoinColumn({ name: 'plans_id' })
	plans: PlansOrmEntity;

	@ManyToOne(() => ModuleOrmEntity, { nullable: true })
	@JoinColumn({ name: 'module_id' })
	module: ModuleOrmEntity;

	@ManyToOne(() => subModulesOrmEntity, { nullable: true })
	@JoinColumn({ name: 'sub_module_id' })
	subModule: subModulesOrmEntity;

	@CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
	created_at: Date;
}