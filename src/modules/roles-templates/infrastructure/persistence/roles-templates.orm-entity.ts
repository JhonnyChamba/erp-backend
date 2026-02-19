import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { UsersOrmEntity } from 'src/modules/users/infrastructure/persistence/users.orm-entity';

@Entity('tab_role')
export class RolesTemplatesOrmEntity {

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