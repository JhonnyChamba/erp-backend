import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { CompanyOrmEntity } from 'src/modules/company/infrastructure/persistence/company.orm-entity';

@Entity('tab_users')
export class UsersOrmEntity {

	@PrimaryGeneratedColumn()
	id: number;

	// Relación con empresa (genera company_id automáticamente)
	@ManyToOne(() => CompanyOrmEntity, { nullable: true})
	@JoinColumn({ name: 'company_id' })
	company: CompanyOrmEntity;

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
	multi_company: boolean;

	@Column({ default: true })
	enabled: boolean;

	@Column({ default: false })
	deleted: boolean;

	@CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
	created_at: Date;
}