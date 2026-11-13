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

@Index(['code', 'type'], { unique: true, where: '"deleted" = false' })
@Entity('tab_document_types')
export class DocumentTypeOrmEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ name: 'company_id', nullable: true })
	company_id?: number | null;

	@ManyToOne(() => CompanyOrmEntity, { nullable: true, onDelete: 'CASCADE' })
	@JoinColumn({ name: 'company_id' })
	company?: CompanyOrmEntity | null;

	@Column({ length: 150 })
	name: string;

	// 'CLIENTE' | 'PROVEEDOR' | 'VENDEDOR' | 'TODOS'
	@Column({ length: 50, default: 'TODOS' })
	type: string;

	// SRI Code: '04' (RUC), '05' (Cédula), '06' (Pasaporte), '07' (Consumidor Final), '08' (Identificación del Exterior), etc.
	@Column({ length: 20 })
	code: string;

	@Column({ length: 20, default: 'ACTIVO' })
	status: string;

	@Column({ default: false })
	deleted: boolean;

	@CreateDateColumn({ type: 'timestamp' })
	created_at: Date;

	@UpdateDateColumn({ type: 'timestamp' })
	updated_at: Date;
}

