import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { SurfaceType } from '../../common/enum/campeonato.enum';

@Entity('tab_campeonato_scenaries')
export class ScenaryOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'company_id', type: 'int', nullable: true })
  companyId: number;

  @Column({ name: 'tournaments_id', type: 'varchar', nullable: true })
  tournamentId: string;

  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ type: 'varchar', length: 250, nullable: true })
  location: string;

  @Column({ name: 'address', type: 'varchar', length: 250, nullable: true })
  address: string;

  @Column({ name: 'latitude', type: 'varchar', length: 50, nullable: true })
  latitude: string;

  @Column({ name: 'longitude', type: 'varchar', length: 50, nullable: true })
  longitude: string;

  @Column({ name: 'cardinal_points', type: 'varchar', length: 150, nullable: true })
  cardinalPoints: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  code: string;

  @Column({ name: 'surface_type', type: 'enum', enum: SurfaceType, default: SurfaceType.SYNTHETIC })
  surfaceType: SurfaceType;

  @Column({ name: 'has_lighting', type: 'boolean', default: false })
  hasLighting: boolean;

  @Column({ name: 'google_maps_url', type: 'text', nullable: true })
  googleMapsUrl: string;

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
