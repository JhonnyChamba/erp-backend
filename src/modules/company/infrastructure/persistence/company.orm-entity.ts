import { UsersOrmEntity } from 'src/modules/users/infrastructure/persistence/users.orm-entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';

@Entity('tab_company')
export class CompanyOrmEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	ruc: string;

	@Column()
	description: string;

	@Column()
	business_name: string;

	@Column()
	trade_name: string;

	@Column({ default: true })
	enabled: boolean;

	@Column({ default: false })
	deleted: boolean;

	// Datos del usuario que registra
	@ManyToOne(() => UsersOrmEntity, { nullable: true })
	@JoinColumn({ name: 'created_by' })
	createdBy: UsersOrmEntity;

	@Column({ nullable: true })
	created_name: string;

	@CreateDateColumn({ name: 'created_at' })
	createdAt: Date;

	// Datos del usuario que modifica
	@ManyToOne(() => UsersOrmEntity, { nullable: true })
	@JoinColumn({ name: 'updated_by' })
	updatedBy: UsersOrmEntity;

	@Column({ nullable: true })
	update_name: string;

	@UpdateDateColumn({ name: 'updated_at', nullable: true })
	updatedAt: Date;

	// Datos del usuario que elimina
	@ManyToOne(() => UsersOrmEntity, { nullable: true })
	@JoinColumn({ name: 'deleted_by' })
	deletedBy: UsersOrmEntity;

	@Column({ nullable: true })
	deleted_name: string;

	@DeleteDateColumn({ name: 'deleted_at' })
	deletedAt?: Date;
}