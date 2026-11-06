import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { CompanyOrmEntity } from 'src/modules/company/infrastructure/persistence/company.orm-entity';
import { UserCompanyOrmEntity } from 'src/modules/user-company/infrastructure/persistence/user-company.orm-entity';
import { RolesOrmEntity } from 'src/modules/roles/infrastructure/persistence/roles.orm-entity';

@Entity('tab_users')
export class UsersOrmEntity {

	@PrimaryGeneratedColumn()
	id: number;

	// Relación con empresa principal
	@ManyToOne(() => CompanyOrmEntity, { nullable: true })
	@JoinColumn({ name: 'company_id' })
	company: CompanyOrmEntity;

	// Rol principal del usuario (cuando pertenece a una sola empresa)
	@ManyToOne(() => RolesOrmEntity, { nullable: true })
	@JoinColumn({ name: 'role_id' })
	role: RolesOrmEntity;

	@OneToMany(() => UserCompanyOrmEntity, (uc) => uc.user)
	userCompanies: UserCompanyOrmEntity[];

	@Column()
	num_document: string;

	@Column()
	name_user: string;

	@Column()
	last_name_user: string;

	@Column({ unique: true })
	email: string;

	@Column()
	password: string;

	@Column({ default: false })
	developer: boolean;

	@Column({ default: false })
	super_admin: boolean;

	@Column({ default: false })
	multi_company: boolean;

	@Column({ default: true })
	enabled: boolean;

	@Column({ default: false })
	deleted: boolean;

	@Column({ default: 'Blue_Theme', nullable: true })
	theme_color: string;

	@CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
	created_at: Date;
}
