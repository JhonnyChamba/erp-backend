import { UsersOrmEntity } from 'src/modules/users/infrastructure/persistence/users.orm-entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('tab_permissions')
export class PermissionsTemplatesOrmEntity {

	@PrimaryGeneratedColumn()
	id: number;

	@Column({ length: 20 })
	code: string;

	@Column({ length: 150 })
	description: string;

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