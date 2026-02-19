import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { CompanyOrmEntity } from 'src/modules/company/infrastructure/persistence/company.orm-entity';
import { UsersOrmEntity } from 'src/modules/users/infrastructure/persistence/users.orm-entity';

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