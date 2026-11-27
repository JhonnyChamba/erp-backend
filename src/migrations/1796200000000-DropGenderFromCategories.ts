import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropGenderFromCategories1796200000000 implements MigrationInterface {
  name = 'DropGenderFromCategories1796200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "tab_campeonato_categories"
      DROP COLUMN IF EXISTS "gender"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "tab_campeonato_categories"
      ADD COLUMN IF NOT EXISTS "gender" varchar(20) DEFAULT 'MALE'
    `);
  }
}
