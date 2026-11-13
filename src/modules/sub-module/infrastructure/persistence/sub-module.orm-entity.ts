import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ModuleOrmEntity } from 'src/modules/module/infrastructure/persistence/module.orm-entity';
import { UsersOrmEntity } from 'src/modules/users/infrastructure/persistence/users.orm-entity';

@Entity('tab_sub_module')
export class subModulesOrmEntity {

	@PrimaryGeneratedColumn()
	id: number;

	@Column({ length: 20 })
	code: string;

	@Column()
	desc_icon: string;

	@Column({ length: 150 })
	description: string;

	@Column()
	url_desc: string;

	@Column({ name: 'order_index', type: 'int', default: 0 })
	order_index: number;

	// Relación con el modulo (genera module_id automáticamente)
	@ManyToOne(() => ModuleOrmEntity, { nullable: true }) // <- relación
	@JoinColumn({ name: 'module_id' })
	module: ModuleOrmEntity;

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