import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { CategoryEditionOrmEntity } from './category-edition.orm-entity';
import { CategoryOrmEntity } from './category.orm-entity';
import { EditionCategoryClassificationOrmEntity } from './edition-category-classification.orm-entity';

@Entity('tab_campeonato_edition_category_details')
export class EditionCategoryDetailOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id', type: 'int', nullable: true })
  companyId: number;

  @Column({ name: 'tournaments_id', type: 'varchar', nullable: true })
  tournamentId: string;

  @Column({ name: 'edition_id', type: 'uuid' })
  editionId: string;

  @ManyToOne(() => CategoryEditionOrmEntity, (edition) => edition.categoriesDetail, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'edition_id' })
  edition: CategoryEditionOrmEntity;

  @Column({ name: 'category_id', type: 'uuid' })
  categoryId: string;

  @ManyToOne(() => CategoryOrmEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'category_id' })
  category: CategoryOrmEntity;

  @OneToMany(() => EditionCategoryClassificationOrmEntity, (cls) => cls.categoryDetail, { cascade: true })
  classifications: EditionCategoryClassificationOrmEntity[];

  @Column({ name: 'category_description', type: 'varchar', length: 150, nullable: true })
  categoryDescription: string;

  @Column({ name: 'start_date', type: 'date', nullable: true })
  startDate: Date;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate: Date;

  @Column({ name: 'registration_fee', type: 'numeric', precision: 10, scale: 2, default: 0 })
  registrationFee: number;

  @Column({ name: 'max_players', type: 'int', default: 25 })
  maxPlayers: number;

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
