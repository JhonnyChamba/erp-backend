import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ModuleOrmEntity } from 'src/modules/module/infrastructure/persistence/module.orm-entity';
import { PlansOrmEntity } from 'src/modules/plans/infrastructure/persistence/plans.orm-entity';

@Entity('tab_plans_module')
export class PlansModulesOrmEntity {

	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => PlansOrmEntity, { nullable: true }) // <- relación
	@JoinColumn({ name: 'plans_id' })
	plans: PlansOrmEntity;

	@ManyToOne(() => ModuleOrmEntity, { nullable: true }) // <- relación
	@JoinColumn({ name: 'module_id' })
	module: ModuleOrmEntity;

	@CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
	created_at: Date;
}