import {
	Column,
	CreateDateColumn,
	Entity,
	Index,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';
import { CompanyOrmEntity } from 'src/modules/company/infrastructure/persistence/company.orm-entity';

@Index(['company_id', 'code'], { unique: true, where: '"deleted" = false' })
@Entity('tab_taxes')
export class TaxOrmEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ name: 'company_id' })
	company_id: number;

	@ManyToOne(() => CompanyOrmEntity, { nullable: false, onDelete: 'CASCADE' })
	@JoinColumn({ name: 'company_id' })
	company: CompanyOrmEntity;

	@Column({ length: 50 })
	code: string;

	@Column('numeric', { precision: 5, scale: 2, default: 0 })
	percentage: number;

	@Column({ length: 250 })
	description: string;

	@Column({ length: 20, default: 'ACTIVO' })
	status: string;

	@Column({ name: 'is_default', default: false })
	is_default: boolean;

	@Column({ default: false })
	deleted: boolean;

	@CreateDateColumn({ type: 'timestamp' })
	created_at: Date;

	@UpdateDateColumn({ type: 'timestamp' })
	updated_at: Date;
}
