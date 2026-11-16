import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { PositionOrmEntity } from './position.orm-entity';
import { TeamOrmEntity } from './team.orm-entity';
import { PlayerOrmEntity } from './player.orm-entity';

@Entity('tab_campeonato_team_managements')
export class TeamManagementOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id', type: 'int', nullable: true })
  companyId: number;

  @Column({ name: 'tournaments_id', type: 'varchar', nullable: true })
  tournamentId: string;

  @Column({ name: 'position_id', type: 'uuid' })
  positionId: string;

  @ManyToOne(() => PositionOrmEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'position_id' })
  position: PositionOrmEntity;

  @Column({ name: 'team_id', type: 'uuid' })
  teamId: string;

  @ManyToOne(() => TeamOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'team_id' })
  team: TeamOrmEntity;

  @Column({ name: 'player_id', type: 'uuid', nullable: true })
  playerId: string;

  @ManyToOne(() => PlayerOrmEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'player_id' })
  player: PlayerOrmEntity;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ name: 'last_name', type: 'varchar', length: 100 })
  lastName: string;

  @Column({ type: 'varchar', length: 50 })
  identification: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  cellphone: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  email: string;

  @Column({ type: 'varchar', length: 250, nullable: true })
  address: string;

  @Column({ name: 'license_number', type: 'varchar', length: 100, nullable: true })
  licenseNumber: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

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
