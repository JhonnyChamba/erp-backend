import { CompanyOrmEntity } from 'src/modules/company/infrastructure/persistence/company.orm-entity';
import { UsersOrmEntity } from 'src/modules/users/infrastructure/persistence/users.orm-entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('tab_users_company')
export class UserCompanyOrmEntity {

	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => UsersOrmEntity, (u) => u.userCompanies)
	@JoinColumn({ name: 'user_id' })
	user: UsersOrmEntity;

	@ManyToOne(() => CompanyOrmEntity)
	@JoinColumn({ name: 'company_id' })
	company: CompanyOrmEntity;

	@Column({ default: true })
	enabled: boolean;

	@Column({ default: false })
	deleted: boolean;

	@CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
	created_at: Date;
}
