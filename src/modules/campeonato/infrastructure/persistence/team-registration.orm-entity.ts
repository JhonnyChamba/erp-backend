import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { RegistrationStatus, PaymentStatus } from '../../common/enum/campeonato.enum';
import { CategoryEditionOrmEntity } from './category-edition.orm-entity';
import { TeamOrmEntity } from './team.orm-entity';

@Entity('tab_campeonato_team_registrations')
@Unique(['categoryEditionId', 'teamId'])
export class TeamRegistrationOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'company_id', type: 'int', nullable: true })
  companyId: number;

  @Column({ name: 'tournaments_id', type: 'int', nullable: true })
  tournamentId: number;

  @Column({ name: 'category_edition_id', type: 'int' })
  categoryEditionId: number;

  @ManyToOne(() => CategoryEditionOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'category_edition_id' })
  categoryEdition: CategoryEditionOrmEntity;

  @Column({ name: 'team_id', type: 'int' })
  teamId: number;

  @ManyToOne(() => TeamOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'team_id' })
  team: TeamOrmEntity;

  @Column({ name: 'group_name', type: 'varchar', length: 50, nullable: true })
  groupName: string;

  @Column({ type: 'enum', enum: RegistrationStatus, default: RegistrationStatus.PENDING })
  status: RegistrationStatus;

  @Column({ name: 'payment_status', type: 'enum', enum: PaymentStatus, default: PaymentStatus.UNPAID })
  paymentStatus: PaymentStatus;

  @Column({ name: 'points_penalty', type: 'int', default: 0 })
  pointsPenalty: number;

  @Column({ name: 'created_name', type: 'varchar', nullable: true })
  createdName: string;

  @Column({ name: 'created_by', type: 'varchar', nullable: true })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'update_name', type: 'varchar', nullable: true })
  updateName: string;

  @Column({ name: 'updated_by', type: 'varchar', nullable: true })
  updatedBy: string;

  @UpdateDateColumn({ name: 'updated_at', nullable: true })
  updatedAt: Date;
}
