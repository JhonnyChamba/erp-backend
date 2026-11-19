import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Gender, DominantFoot } from '../../common/enum/campeonato.enum';
import { DemarcationOrmEntity } from './demarcation.orm-entity';
import { TeamOrmEntity } from './team.orm-entity';
import { PlayerClassificationOrmEntity } from './player-classification.orm-entity';

@Entity('tab_campeonato_players')
export class PlayerOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'company_id', type: 'int', nullable: true })
  companyId: number;

  @Column({ name: 'tournaments_id', type: 'varchar', nullable: true })
  tournamentId: string;

  @Column({ name: 'demarcation_id', type: 'int', nullable: true })
  demarcationId: number;

  @ManyToOne(() => DemarcationOrmEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'demarcation_id' })
  demarcation: DemarcationOrmEntity;

  @Column({ name: 'player_classification_id', type: 'int', nullable: true })
  playerClassificationId: number;

  @ManyToOne(() => PlayerClassificationOrmEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'player_classification_id' })
  playerClassification: PlayerClassificationOrmEntity;

  @Column({ name: 'current_team_id', type: 'int', nullable: true })
  currentTeamId: number;

  @ManyToOne(() => TeamOrmEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'current_team_id' })
  currentTeam: TeamOrmEntity;

  @Column({ name: 'pass_owner_type', type: 'varchar', length: 20, default: 'PLAYER' })
  passOwnerType: string; // 'PLAYER' (dueño de su pase) o 'TEAM' (club es dueño del pase)

  @Column({ name: 'pass_owner_team_id', type: 'int', nullable: true })
  passOwnerTeamId: number;

  @ManyToOne(() => TeamOrmEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'pass_owner_team_id' })
  passOwnerTeam: TeamOrmEntity;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ name: 'last_name', type: 'varchar', length: 100 })
  lastName: string;

  @Column({ type: 'varchar', length: 50 })
  identification: string;

  @Column({ name: 'is_foreigner', type: 'boolean', default: false })
  isForeigner: boolean;

  @Column({ name: 'code', type: 'varchar', length: 50, nullable: true })
  code: string;

  @Column({ name: 'birth_date', type: 'date', nullable: true })
  birthDate: Date;

  @Column({ name: 'age_years', type: 'int', nullable: true })
  ageYears: number;

  @Column({ name: 'age_months', type: 'int', nullable: true })
  ageMonths: number;

  @Column({ type: 'enum', enum: Gender, default: Gender.MALE })
  gender: Gender;

  @Column({ name: 'jersey_number', type: 'int', nullable: true })
  jerseyNumber: number;

  @Column({ type: 'varchar', length: 250, nullable: true })
  address: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  email: string;

  @Column({ type: 'text', nullable: true })
  photo: string;

  @Column({ name: 'blood_type', type: 'varchar', length: 10, nullable: true })
  bloodType: string;

  @Column({ name: 'dominant_foot', type: 'enum', enum: DominantFoot, nullable: true })
  dominantFoot: DominantFoot;

  @Column({ name: 'emergency_contact_name', type: 'varchar', length: 150, nullable: true })
  emergencyContactName: string;

  @Column({ name: 'emergency_contact_phone', type: 'varchar', length: 50, nullable: true })
  emergencyContactPhone: string;

  @Column({ name: 'medical_clearance_expiry', type: 'date', nullable: true })
  medicalClearanceExpiry: Date;

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
