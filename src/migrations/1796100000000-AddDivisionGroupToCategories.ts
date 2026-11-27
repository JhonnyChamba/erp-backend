import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDivisionGroupToCategories1796100000000 implements MigrationInterface {
  name = 'AddDivisionGroupToCategories1796100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "tab_campeonato_categories"
      ADD COLUMN IF NOT EXISTS "division_group_id" integer
    `);
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'FK_tab_campeonato_categories_division_group'
        ) THEN
          ALTER TABLE "tab_campeonato_categories"
          ADD CONSTRAINT "FK_tab_campeonato_categories_division_group"
          FOREIGN KEY ("division_group_id") REFERENCES "tab_campeonato_division_groups"("id")
          ON DELETE SET NULL;
        END IF;
      END$$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "tab_campeonato_categories"
      DROP CONSTRAINT IF EXISTS "FK_tab_campeonato_categories_division_group"
    `);
    await queryRunner.query(`
      ALTER TABLE "tab_campeonato_categories"
      DROP COLUMN IF EXISTS "division_group_id"
    `);
  }
}
