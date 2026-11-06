import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { CompanyOrmEntity } from 'src/modules/company/infrastructure/persistence/company.orm-entity';
import { UsersOrmEntity } from 'src/modules/users/infrastructure/persistence/users.orm-entity';
import { ModuleOrmEntity } from 'src/modules/module/infrastructure/persistence/module.orm-entity';
import { subModulesOrmEntity } from 'src/modules/sub-module/infrastructure/persistence/sub-module.orm-entity';

@Entity('tab_role')
export class RolesOrmEntity {

	@PrimaryGeneratedColumn()
	id: number;

	@Column({ length: 20 })
	code: string;

	@Column({ length: 150 })
	description: string;

	// Relación con empresa (genera company_id automáticamente)
	@ManyToOne(() => CompanyOrmEntity, { nullable: true })
	@JoinColumn({ name: 'company_id' })
	company: CompanyOrmEntity;

	@OneToMany(() => RoleModuleOrmEntity, (rm) => rm.role)
	roleModules: RoleModuleOrmEntity[];

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

@Entity('tab_role_module')
export class RoleModuleOrmEntity {

	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => RolesOrmEntity, (role) => role.roleModules, { nullable: false })
	@JoinColumn({ name: 'role_id' })
	role: RolesOrmEntity;

	@ManyToOne(() => ModuleOrmEntity, { nullable: true })
	@JoinColumn({ name: 'module_id' })
	module: ModuleOrmEntity;

	@ManyToOne(() => subModulesOrmEntity, { nullable: true })
	@JoinColumn({ name: 'sub_module_id' })
	subModule: subModulesOrmEntity;

	@Column({ default: true })
	has_access: boolean;

	@Column({ default: true })
	enabled: boolean;

	@Column({ default: false })
	deleted: boolean;

	@CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
	created_at: Date;
}